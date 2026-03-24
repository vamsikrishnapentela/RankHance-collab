require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');
const MockTestAttempt = require('./models/MockTestAttempt');
const Ticket = require('./models/Ticket');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rankhance', {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
});

const readJsonFile = (filePath) => {
    try {
        const absolutePath = path.join(__dirname, 'data', filePath);
        if (fs.existsSync(absolutePath)) {
            const data = fs.readFileSync(absolutePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error("Error reading file:", filePath, error);
        return null;
    }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, referredBy } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        let validReferral = null;
        if (referredBy) {
            const refUser = await User.findOne({ referralCode: referredBy });
            if (refUser) validReferral = referredBy;
        }

        user = new User({ name, email, phone, password: await bcrypt.hash(password, 10), referredBy: validReferral });
        await user.save();

        if (validReferral) {
            const creator = await User.findOne({ referralCode: validReferral, isCreator: true });
            if (creator && creator.email !== email) {
                creator.referralCount = (creator.referralCount || 0) + 1;
                await creator.save();
            }
        }

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'YOUR_JWT_SECRET', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isAdmin: user.isAdmin || false, referralCode: user.referralCode || null } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'YOUR_JWT_SECRET', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isAdmin: user.isAdmin || false, referralCode: user.referralCode || null } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    const { tokenId, referredBy } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (user) {
            user.googleId = googleId;
            await user.save();
        } else {
            let validReferral = null;
            if (referredBy) {
                const refUser = await User.findOne({ referralCode: referredBy });
                if (refUser) validReferral = referredBy;
            }
            user = new User({ name, email, googleId, referredBy: validReferral });
            await user.save();

            if (validReferral) {
                const creator = await User.findOne({ referralCode: validReferral, isCreator: true });
                if (creator) {
                    creator.referralCount = (creator.referralCount || 0) + 1;
                    await creator.save();
                }
            }
        }

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'YOUR_JWT_SECRET', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isAdmin: user.isAdmin || false, referralCode: user.referralCode || null } });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Google authentication failed' });
    }
});

app.get('/api/auth/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Forgot Password / OTP ────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.lastOTPSentAt && (Date.now() - user.lastOTPSentAt.getTime()) < 60000) {
            const waitTime = Math.ceil((60000 - (Date.now() - user.lastOTPSentAt.getTime())) / 1000);
            return res.status(400).json({ message: `Please wait ${waitTime}s before resending OTP` });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 120000;
        user.lastOTPSentAt = Date.now();
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP - RankHance',
            text: `Your OTP for password reset is: ${otp}. It is valid for 2 minutes.`
        });
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordOTPExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
        res.json({ message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordOTPExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Security session expired, please request a new OTP' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Payment ──────────────────────────────────────────────────────────────────

app.post('/api/payment/create-order', auth, async (req, res) => {
    try {
        const options = { amount: 9900, currency: "INR", receipt: "receipt_" + req.user.id };
        const order = await razorpay.orders.create(options);
        await User.findByIdAndUpdate(req.user.id, { razorpayOrderId: order.id });
        res.json(order);
    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ message: "Failed to create order" });
    }
});

app.post('/api/payment/verify', auth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.razorpayOrderId !== razorpay_order_id)
            return res.status(400).json({ message: "Invalid order ID or session mismatch" });
        if (user.isPaid) return res.json({ success: true, message: "Already verified" });

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature)
            return res.status(400).json({ message: "Payment verification failed" });

        user.isPaid = true;
        user.razorpayOrderId = undefined;

        if (user.referredBy) {
            const creator = await User.findOne({ referralCode: user.referredBy, isCreator: true });
            if (creator && creator.email !== user.email) {
                creator.paidReferrals = (creator.paidReferrals || 0) + 1;
                creator.earnings = (creator.earnings || 0) + Math.floor(0.1 * 99);
                await creator.save();
            }
        }

        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Server error during verification" });
    }
});

app.post('/api/payment/verify-redirect', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const frontend = req.query.frontend || 'https://rankhance.in';
    try {
        const user = await User.findOne({ razorpayOrderId: razorpay_order_id });
        if (!user) return res.redirect(`${frontend}/dashboard?payment=failed`);
        if (user.isPaid) return res.redirect(`${frontend}/dashboard?payment=success`);

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature)
            return res.redirect(`${frontend}/dashboard?payment=failed_signature`);

        user.isPaid = true;
        user.razorpayOrderId = undefined;

        if (user.referredBy) {
            const creator = await User.findOne({ referralCode: user.referredBy, isCreator: true });
            if (creator && creator.email !== user.email) {
                creator.paidReferrals = (creator.paidReferrals || 0) + 1;
                creator.earnings = (creator.earnings || 0) + Math.floor(0.1 * 99);
                await creator.save();
            }
        }
        await user.save();
        res.redirect(`${frontend}/dashboard?payment=success`);
    } catch (err) {
        console.error("Redirect verification error:", err);
        res.redirect(`${frontend}/dashboard?payment=error`);
    }
});

// ─── Content ──────────────────────────────────────────────────────────────────

app.get('/api/subjects', (req, res) => {
    const data = readJsonFile('subjects/data.json');
    res.json(data || []);
});

app.get('/api/:chapterType/:subjectId', async (req, res, next) => {
    const { chapterType, subjectId } = req.params;
    const token = req.header('x-auth-token');
    let paid = false;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }

    if (chapterType.startsWith('chapters')) {
        let data = readJsonFile(`${chapterType}/${subjectId}/data.json`);
        if (!data) {
            data = readJsonFile(`chapter-names/${subjectId}/data.json`)
                || readJsonFile(`chapters_formulas/${subjectId}/data.json`)
                || readJsonFile(`chapters_practice/${subjectId}/data.json`);
        }
        if (data) {
            return res.json(data.map((ch, idx) => ({ ...ch, locked: !paid && idx >= 2 })));
        }
        return res.status(404).json({ message: "Subject not found" });
    }
    next();
});

app.get('/api/questions/:chapterId', async (req, res) => {
    const { chapterId } = req.params;

    // Auth Check
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }

    const chNum = parseInt(chapterId.slice(1), 10);
    if (!paid && chNum > 2) {
        return res.status(403).json({ message: "Premium content. Please upgrade." });
    }

    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    res.json(readJsonFile(`2-Chapter Practice-questions/${subjectId}/${chapterId}/data.json`) || []);
});

app.get('/api/quiz/:chapterId', async (req, res) => {
    const { chapterId } = req.params;

    // Auth Check
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }

    const chNum = parseInt(chapterId.slice(1), 10);
    if (!paid && chNum > 2) {
        return res.status(403).json({ message: "Premium content. Please upgrade." });
    }

    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    res.json(readJsonFile(`1-quiz-questions/${subjectId}/${chapterId}/data.json`) || []);
});

app.get('/api/mocktests', async (req, res) => {
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }
    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        return res.json(data.map((t, idx) => ({
            id: t.id, name: t.name, duration: t.duration,
            totalQuestions: t.totalQuestions, distribution: t.distribution,
            locked: !paid && idx >= 2
        })));
    }
    res.json([]);
});

app.get('/api/formulas/:subject/:year', async (req, res) => {
    const { subject, year } = req.params;
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }

    const data = readJsonFile(`formulas/${subject}-${year}.json`);
    if (data) {
        return res.json(data.map((ch, idx) => ({ ...ch, locked: !paid && idx >= 1 })));
    }
    res.status(404).json({ message: "Formulas not found for this subject and year" });
});

app.get('/api/weightage', (req, res) => {
    res.json(readJsonFile('weightage/data.json') || []);
});

// ─── Mock Test Attempts ───────────────────────────────────────────────────────
// ⚠️  ORDER MATTERS: specific routes must come before the generic /:testId route

// POST /api/mocktest/submit
app.post('/api/mocktest/submit', auth, async (req, res) => {
    try {
        const { testId, testName, questions, answers, flags, timeTakenSeconds } = req.body;

        const allQuestions = readJsonFile(`3-mocktests-questions/${testId}/data.json`) || [];
        const correctMap = {};
        allQuestions.forEach(q => { correctMap[q.id] = q.correctIndex; });

        const flagSet = new Set(flags || []);
        const answerDocs = (questions || []).map(q => ({
            questionId: q.questionId,
            globalIdx: q.globalIdx,
            subject: q.subject,
            selectedOption: (answers[q.globalIdx] !== undefined && answers[q.globalIdx] !== null)
                ? answers[q.globalIdx] : null,
            isFlagged: flagSet.has(q.globalIdx),
        }));

        let score = 0;
        answerDocs.forEach(a => {
            if (a.selectedOption === null) return;
            a.selectedOption === correctMap[a.questionId] ? score += 4 : score -= 1;
        });

        await MockTestAttempt.findOneAndUpdate(
            { userId: req.user.id, testId },
            {
                userId: req.user.id, testId,
                testName: testName || testId,
                questions: questions || [],
                answers: answerDocs,
                score,
                totalQuestions: (questions || []).length,
                timeTakenSeconds: timeTakenSeconds || 0,
                submittedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, score });
    } catch (err) {
        console.error('Submit attempt error:', err);
        res.status(500).json({ message: 'Failed to save attempt' });
    }
});

// GET /api/mocktest/:testId/attempt  ← MUST be before GET /api/mocktest/:testId
app.get('/api/mocktest/:testId/attempt', auth, async (req, res) => {
    try {
        const { testId } = req.params;

        const attempt = await MockTestAttempt.findOne({ userId: req.user.id, testId });
        if (!attempt) return res.status(404).json({ message: 'No attempt found for this test' });

        const allQuestions = readJsonFile(`3-mocktests-questions/${testId}/data.json`) || [];
        const questionMap = {};
        allQuestions.forEach(q => { questionMap[q.id] = q; });

        const enrichedQuestions = attempt.questions.map(savedQ => {
            const full = questionMap[savedQ.questionId] || {};
            const ans = attempt.answers.find(a => a.globalIdx === savedQ.globalIdx);
            return {
                ...full,
                globalIdx: savedQ.globalIdx,
                subject: savedQ.subject,
                selectedOption: (ans && ans.selectedOption !== undefined) ? ans.selectedOption : null,
                isFlagged: ans ? ans.isFlagged : false,
            };
        });

        res.json({
            testId: attempt.testId,
            testName: attempt.testName,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            timeTakenSeconds: attempt.timeTakenSeconds,
            submittedAt: attempt.submittedAt,
            questions: enrichedQuestions,
        });
    } catch (err) {
        console.error('Fetch attempt error:', err);
        res.status(500).json({ message: 'Failed to fetch attempt' });
    }
});

// GET /api/user/attempts
app.get('/api/user/attempts', auth, async (req, res) => {
    try {
        const attempts = await MockTestAttempt.find({ userId: req.user.id })
            .select('testId testName score totalQuestions submittedAt timeTakenSeconds')
            .sort({ submittedAt: -1 });
        res.json(attempts);
    } catch (err) {
        console.error('Fetch attempts list error:', err);
        res.status(500).json({ message: 'Failed to fetch attempts' });
    }
});

// GET /api/mocktest/:testId  ← MUST be LAST among mocktest routes
app.get('/api/mocktest/:testId', async (req, res) => {
    const { testId } = req.params;
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch (e) { }
    }

    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        const testIdx = data.findIndex(t => t.id === testId);
        const test = data[testIdx];
        if (test) {
            if (!paid && testIdx >= 2)
                return res.status(403).json({ message: "Content locked. Please upgrade to premium." });
            const questions = readJsonFile(`3-mocktests-questions/${testId}/data.json`);
            test.questions = questions || [];
            return res.json(test);
        }
    }
    res.status(404).json({ message: "Mock test not found" });
});

// ─── Creator Dashboard ────────────────────────────────────────────────────────

app.get('/api/creator/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isCreator) return res.status(403).json({ message: "Access denied" });

        const referrals = await User.find({ referredBy: user.referralCode })
            .select('name email isPaid createdAt');

        res.json({
            referralCode: user.referralCode,
            totalReferrals: referrals.length,
            paidReferrals: referrals.filter(u => u.isPaid).length,
            earnings: user.earnings || 0,
            referrals,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

app.get('/api/admin/dashboard', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isAdmin) return res.status(403).json({ message: "Access denied" });

        const totalUsers = await User.countDocuments();
        const paidUsers = await User.countDocuments({ isPaid: true });
        const freeUsers = totalUsers - paidUsers;
        const totalRevenue = paidUsers * 99;

        const creators = await User.find({ isCreator: true });
        const totalCreators = creators.length;
        const totalCommission = creators.reduce((sum, c) => sum + (c.earnings || 0), 0);
        const totalReferrals = creators.reduce((sum, c) => sum + (c.referralCount || 0), 0);
        const totalPaidReferrals = creators.reduce((sum, c) => sum + (c.paidReferrals || 0), 0);

        const users = await User.find().select('name email isPaid referredBy createdAt');
        const creatorList = await User.find({ isCreator: true })
            .select('name email referralCode earnings referralCount paidReferrals');

        res.json({
            usersStats: { totalUsers, paidUsers, freeUsers, totalRevenue },
            creatorStats: { totalCreators, totalCommission, totalReferrals, totalPaidReferrals },
            users,
            creators: creatorList,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── Support System ──────────────────────────────────────────────────────────

app.post('/api/support/ticket', auth, async (req, res) => {
    try {
        const { ticketId, subject, message } = req.body;
        const user = await User.findById(req.user.id);

        if (ticketId) {
            // Reply to existing ticket
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });

            // Only the owner can reply
            if (ticket.userId.toString() !== req.user.id.toString()) return res.status(403).json({ message: "Unauthorized" });

            ticket.messages.push({ sender: 'student', senderName: user.name, message });
            ticket.status = 'Open'; // Re-open since student replied
            ticket.updatedAt = Date.now();
            await ticket.save();
            return res.json(ticket);
        } else {
            // Create new ticket
            const newTicket = new Ticket({
                userId: req.user.id,
                subject,
                messages: [{ sender: 'student', senderName: user.name, message }]
            });
            await newTicket.save();
            return res.json(newTicket);
        }
    } catch (err) {
        console.error("Support error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/support/user-tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/support/admin-tickets', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isAdmin) return res.status(403).json({ message: "Access denied" });

        const tickets = await Ticket.find().populate('userId', 'name email').sort({ updatedAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/support/admin-reply', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isAdmin) return res.status(403).json({ message: "Access denied" });

        const { ticketId, message, status } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        if (message) {
            ticket.messages.push({ sender: 'admin', senderName: admin.name, message });
            ticket.status = status || 'Responded';
        } else if (status) {
            ticket.status = status;
        }

        ticket.updatedAt = Date.now();
        await ticket.save();
        await ticket.populate('userId', 'name email');
        res.json(ticket);
    } catch (err) {
        console.error("Admin reply error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});