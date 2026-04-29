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
const ModelMockAttempt = require('./models/ModelMockAttempt');
const Config = require('./models/Config');
const Ticket = require('./models/Ticket');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());

// Razorpay Webhook - MUST be before express.json() to get raw body
app.get('/api/payment/webhook', (req, res) => {
    res.status(200).send('Razorpay Webhook endpoint is active. Use POST for actual webhooks.');
});

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log('--- Razorpay Webhook Received ---');

    try {
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.body)
            .digest('hex');

        if (generatedSignature !== signature) {
            console.error('Webhook signature verification failed');
            return res.status(200).json({ status: 'ok' });
        }

        const data = JSON.parse(req.body.toString());
        console.log('Webhook Event:', data.event);

        if (data.event === 'payment.captured') {
            const payment = data.payload.payment.entity;
            const order_id = payment.order_id;
            const payment_id = payment.id;

            console.log(`Captured payment ${payment_id} for order ${order_id}`);

            let user = await User.findOne({ razorpayOrderId: order_id });
            
            if (!user && payment.notes && payment.notes.userId) {
                console.log(`User not found by orderId, trying notes.userId: ${payment.notes.userId}`);
                user = await User.findById(payment.notes.userId);
            }

            if (user) {
                console.log(`Matching user found: ${user.email}`);
                if (!user.isPaid) {
                    user.isPaid = true;
                    user.razorpayPaymentId = payment_id;

                    // Referral Commission Logic (Consistent with /verify routes)
                    if (user.referredBy) {
                        const creator = await User.findOne({ referralCode: user.referredBy, isCreator: true });
                        if (creator && creator.email !== user.email) {
                            creator.paidReferrals = (creator.paidReferrals || 0) + 1;
                            const commission = creator.commissionRate || 0;
                            creator.earnings = (creator.earnings || 0) + Math.floor(commission * 99);
                            await creator.save();
                            console.log(`Referral commission updated for creator: ${creator.email}`);
                        }
                    }

                    await user.save();
                    console.log(`User ${user.email} updated to PAID status.`);
                } else {
                    console.log(`User ${user.email} was already marked as PAID.`);
                }
            } else {
                console.warn(`[WEBHOOK WARNING] No user found with razorpayOrderId: ${order_id}. This might happen if manual verification cleared it already, or if the order was never saved.`);
            }
        }
    } catch (err) {
        console.error('Webhook processing error:', err.message);
    }

    res.status(200).json({ status: 'ok' });
});

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
            const rawData = fs.readFileSync(absolutePath, 'utf8').trim();
            const data = JSON.parse(rawData);
            if (Array.isArray(data)) return data;
        }
        return null;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
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
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isManager: user.isManager || false, isSuperAdmin: user.isSuperAdmin || false, referralCode: user.referralCode || null } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.password && user.googleId) {
            return res.status(400).json({ message: 'This email is registered via Google. Please use Continue with Google.' });
        }

        if (!user.password) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'YOUR_JWT_SECRET', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isManager: user.isManager || false, isSuperAdmin: user.isSuperAdmin || false, referralCode: user.referralCode || null } });
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
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isManager: user.isManager || false, isSuperAdmin: user.isSuperAdmin || false, referralCode: user.referralCode || null } });
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
        console.log(`[PAYMENT] Creating order for UserID: ${req.user.id}`);
        const options = { amount: 9900, currency: "INR", receipt: "receipt_" + req.user.id, notes: { userId: req.user.id.toString() } };
        const order = await razorpay.orders.create(options);

        console.log(`[PAYMENT] Razorpay Order Created: ${order.id}. Saving to DB...`);

        // Ensure the ID is saved before we respond
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { razorpayOrderId: order.id },
            { new: true }
        );

        if (!updatedUser) {
            console.error(`[PAYMENT ERROR] Failed to find user ${req.user.id} to save orderId`);
            return res.status(500).json({ message: "User not found" });
        }

        console.log(`[PAYMENT SUCCESS] orderId ${order.id} saved to user ${updatedUser.email}`);
        res.json(order);
    } catch (err) {
        console.error("[PAYMENT ERROR] Order creation failed:", err);
        res.status(500).json({ message: "Failed to create order" });
    }
});

app.post('/api/payment/verify', auth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.isPaid) {
            return res.json({ success: true, message: "Already paid" });
        }

        if (user.razorpayOrderId !== razorpay_order_id) {
            try {
                const order = await razorpay.orders.fetch(razorpay_order_id);
                if (!order || !order.notes || order.notes.userId !== req.user.id) {
                    return res.status(400).json({ message: "Invalid order ID or session mismatch" });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid order ID or session mismatch" });
            }
        }
        console.log(`Payment verification attempt for user: ${user.email}, isPaid: ${user.isPaid}`);

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
                const commission = creator.commissionRate || 0; // fetched strictly from MongoDB
                creator.earnings = (creator.earnings || 0) + Math.floor(commission * 99);
                await creator.save();
            }
        }

        await user.save();
        console.log(`Payment SUCCESSFULLY verified for user: ${user.email}`);
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
        let user = await User.findOne({ razorpayOrderId: razorpay_order_id });
        
        if (!user) {
            try {
                const order = await razorpay.orders.fetch(razorpay_order_id);
                if (order && order.notes && order.notes.userId) {
                    user = await User.findById(order.notes.userId);
                }
            } catch (err) {
                console.error("Failed to fetch order in redirect", err);
            }
        }

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
                const commission = creator.commissionRate || 0; // fetched strictly from MongoDB
                creator.earnings = (creator.earnings || 0) + Math.floor(commission * 99); // referal commission
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
            locked: !paid && t.id.startsWith('adv') && parseInt(t.id.slice(3)) >= 3
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

        let questionsPath = `3-mocktests-questions/advanced/${testId}/data.json`;
        if (!testId.startsWith('adv')) {
            questionsPath = `3-mocktests-questions/${testId}/data.json`;
        }
        const allQuestions = readJsonFile(questionsPath) || [];
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
            if (a.selectedOption === correctMap[a.questionId]) { score += 1 };
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

        let questionsPath = `3-mocktests-questions/advanced/${testId}/data.json`;
        if (!testId.startsWith('adv')) {
            questionsPath = `3-mocktests-questions/${testId}/data.json`;
        }
        const allQuestions = readJsonFile(questionsPath) || [];
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

// ─── Model Mock Test Config ───────────────────────────────────────────────────
const CURRENT_BATCH = {
    batchId: 1,
    testId: 'adv21',
    testName: 'EAMCET Model Mock Test - Batch 1',
    startDate: new Date('2026-04-01T00:00:00.000Z'),
    endDate: new Date('2026-04-30T23:59:59.000Z'),
    isActive: true
};

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
            const isModelMockFree = CURRENT_BATCH && CURRENT_BATCH.isActive && testId === CURRENT_BATCH.testId;
            if (!paid && testIdx >= 2 && !isModelMockFree)
                return res.status(403).json({ message: "Content locked. Please upgrade to premium." });
            let questionsPath = `3-mocktests-questions/advanced/${testId}/data.json`;
            if (!testId.startsWith('adv')) {
                questionsPath = `3-mocktests-questions/${testId}/data.json`;
            }
            const questions = readJsonFile(questionsPath);
            test.questions = questions || [];
            return res.json(test);
        }
    }
    res.status(404).json({ message: "Mock test not found" });
});

// ─── Model Mock Test ──────────────────────────────────────────────────────────

app.get('/api/model-mock/status', async (req, res) => {
    try {
        res.json(CURRENT_BATCH);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/model-mock/submit', auth, async (req, res) => {
    try {
        const { testId, testName, questions, answers, flags, timeTakenSeconds } = req.body;
        const batchId = CURRENT_BATCH.batchId;

        if (!CURRENT_BATCH.isActive) {
            return res.status(403).json({ message: 'No active batch available' });
        }

        const existingAttempt = await ModelMockAttempt.findOne({ userId: req.user.id, batchId });
        if (existingAttempt) {
            return res.status(403).json({ message: 'You have already attempted the current model mock test. Multiple attempts are not allowed.' });
        }

        let questionsPath = `3-mocktests-questions/advanced/${testId}/data.json`;
        if (!testId.startsWith('adv')) {
            questionsPath = `3-mocktests-questions/${testId}/data.json`;
        }
        const allQuestions = readJsonFile(questionsPath) || [];
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
            if (a.selectedOption === correctMap[a.questionId]) { score += 1 };
        });

        const user = await User.findById(req.user.id);
        const attempt = await ModelMockAttempt.findOneAndUpdate(
            { userId: req.user.id, batchId },
            {
                userId: req.user.id, testId, batchId,
                testName: testName || testId,
                userName: user?.name || 'Unknown',
                userEmail: user?.email || '',
                userPhone: user?.phone || '',
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
        console.error('Submit model mock attempt error:', err);
        res.status(500).json({ message: 'Failed to save model mock attempt' });
    }
});

app.get('/api/model-mock/attempt', auth, async (req, res) => {
    try {
        const batchId = CURRENT_BATCH.batchId;
        const attempt = await ModelMockAttempt.findOne({ userId: req.user.id, batchId });

        if (!attempt) return res.json({ hasAttempted: false });

        let questionsPath = `3-mocktests-questions/advanced/${attempt.testId}/data.json`;
        if (!attempt.testId.startsWith('adv')) {
            questionsPath = `3-mocktests-questions/${attempt.testId}/data.json`;
        }
        const allQuestions = readJsonFile(questionsPath) || [];
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
            hasAttempted: true,
            attempt: {
                testId: attempt.testId,
                testName: attempt.testName,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                timeTakenSeconds: attempt.timeTakenSeconds,
                submittedAt: attempt.submittedAt,
                questions: enrichedQuestions,
            }
        });
    } catch (err) {
        console.error('Fetch model mock attempt error:', err);
        res.status(500).json({ message: 'Failed to fetch model mock attempt' });
    }
});

app.get('/api/model-mock/leaderboard', async (req, res) => {
    try {
        const batchId = CURRENT_BATCH.batchId;
        // Find top 100
        const topAttempts = await ModelMockAttempt.find({ batchId })
            .sort({ score: -1, timeTakenSeconds: 1 })
            .limit(100)
            .populate('userId', 'name')
            .lean();

        const leaderboard = topAttempts.map((attempt, index) => ({
            rank: index + 1,
            name: attempt.userId ? attempt.userId.name : 'Unknown User',
            score: attempt.score,
            timeTakenSeconds: attempt.timeTakenSeconds,
            submittedAt: attempt.submittedAt
        }));

        res.json(leaderboard);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
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
            referralCount: referrals.length,
            commissionRate: user.commissionRate || 0, // removed hardcoded default
            paidReferrals: referrals.filter(u => u.isPaid).length,
            earnings: user.earnings || 0,
            referrals,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── Super Admin Dashboard ───────────────────────────────────────────────────
app.get('/api/superadmin/user-search', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email required" });

        const targetUser = await User.findOne({ email });
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        res.json(targetUser); // Returns full document including googleId, phone, etc.
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/superadmin/update-user', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const { email, updates, key } = req.body;
        if (key !== 'mamatha') return res.status(403).json({ message: "Invalid action key. Security verification failed." });

        // Allowed updates: isPaid, isCreator, commissionRate, referralCode, isManager, isSuperAdmin
        const allowedUpdates = ['isPaid', 'isCreator', 'commissionRate', 'referralCode', 'isManager'];
        const finalUpdates = {};

        Object.keys(updates).forEach(k => {
            if (allowedUpdates.includes(k)) {
                finalUpdates[k] = updates[k];
            }
        });

        const user = await User.findOneAndUpdate({ email }, { $set: finalUpdates }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/superadmin/analytics', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        // Daily Registrations (last 30 days)
        const daily = await User.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Monthly Registrations (last 12 months)
        const monthly = await User.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Yearly
        const yearly = await User.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({ daily, monthly, yearly });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/superadmin/export-users', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const { type } = req.query; // all | paid | free
        let query = {};
        if (type === 'paid') query = { isPaid: true };
        if (type === 'free') query = { isPaid: false };

        const users = await User.find(query).select('name email phone isPaid createdAt');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/superadmin/referral-report', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const creators = await User.find({ isCreator: true }).select('name email referralCode referralCount paidReferrals earnings');
        const report = await Promise.all(creators.map(async (c) => {
            const referredUsers = await User.find({ referredBy: c.referralCode }).select('name email isPaid createdAt');
            return {
                ...c.toObject(),
                referredUsers
            };
        }));

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── Manager Dashboard ──────────────────────────────────────────────────────────
// Formerly Admin Dashboard
app.get('/api/manager/dashboard', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || (!admin.isManager && !admin.isSuperAdmin)) return res.status(403).json({ message: "Access denied" });

        const totalUsers = await User.countDocuments();
        const paidUsers = await User.countDocuments({ isPaid: true });
        const freeUsers = totalUsers - paidUsers;
        const totalRevenue = paidUsers * 99;

        const creators = await User.find({ isCreator: true });
        const totalCreators = creators.length;
        const totalCommission = creators.reduce((sum, c) => sum + (c.earnings || 0), 0);
        const totalReferrals = creators.reduce((sum, c) => sum + (c.referralCount || 0), 0);
        const totalPaidReferrals = creators.reduce((sum, c) => sum + (c.paidReferrals || 0), 0);

        const Users = await User.find().select('name email isPaid referredBy createdAt');
        const creatorList = await User.find({ isCreator: true })
            .select('name email referralCode earnings referralCount paidReferrals');

        const modelMockLeaderboard = await ModelMockAttempt.find({ batchId: CURRENT_BATCH.batchId })
            .sort({ score: -1, timeTakenSeconds: 1 })
            .limit(100)
            .lean();

        res.json({
            usersStats: { totalUsers, paidUsers, freeUsers, totalRevenue },
            creatorStats: { totalCreators, totalCommission, totalReferrals, totalPaidReferrals },
            users: Users,
            creators: creatorList,
            modelMockLeaderboard,
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
        if (!admin || (!admin.isManager && !admin.isSuperAdmin)) return res.status(403).json({ message: "Access denied" });

        const tickets = await Ticket.find().populate('userId', 'name email').sort({ updatedAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/support/admin-reply', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || (!admin.isManager && !admin.isSuperAdmin)) return res.status(403).json({ message: "Access denied" });

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

app.get('/api/public/announcement', async (req, res) => {
    try {
        const config = await Config.findOne({ key: 'announcement' });
        res.json(config || { title: "", content: "", isActive: false, buttonText: "", buttonLink: "", displayDate: "" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/superadmin/announcement', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const { title, content, isActive, buttonText, buttonLink, displayDate, key: securityKey } = req.body;
        if (securityKey !== 'mamatha') return res.status(403).json({ message: "Invalid action key" });

        const config = await Config.findOneAndUpdate(
            { key: 'announcement' },
            { $set: { title, content, isActive, buttonText, buttonLink, displayDate, updatedAt: Date.now() } },
            { upsert: true, new: true }
        );

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/superadmin/batch-verify', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || !admin.isSuperAdmin) return res.status(403).json({ message: "Access denied" });

        const { emails } = req.body; // Array of strings (emails)
        if (!Array.isArray(emails)) return res.status(400).json({ message: "Invalid input" });

        const cleanEmails = emails.map(e => e.toLowerCase().trim());

        // 1. Matches for the provided input
        const results = await Promise.all(cleanEmails.map(async (email) => {
            const found = await User.findOne({ email });
            return {
                inputEmail: email,
                dbUser: found ? {
                    name: found.name,
                    email: found.email,
                    phone: found.phone,
                    isPaid: found.isPaid
                } : null
            };
        }));

        // 2. Inverse check: Find Paid users NOT in the input list
        const allPaidUsers = await User.find({ isPaid: true }).select('name email phone');
        const missingFromInput = allPaidUsers.filter(u => !cleanEmails.includes(u.email.toLowerCase()));

        res.json({ results, missingFromInput });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});