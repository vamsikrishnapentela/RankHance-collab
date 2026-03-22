require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rankhance')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize Razorpay
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


// --- Auth Endpoints ---

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, referredBy } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        
        // ✅ Validate referral code (if provided)
        let validReferral = null;

        if (referredBy) {
            const refUser = await User.findOne({ referralCode: referredBy });

            if (refUser) {
                validReferral = referredBy;
            }
        }

        user = new User({ name, email, password: await bcrypt.hash(password, 10), referredBy: validReferral });
        await user.save();
        //updating the referral count for the creator
        if (validReferral) {
            const creator = await User.findOne({
                referralCode: validReferral,
                isCreator: true
            });

            if (creator && creator.email !== email) { // Prevent self-referral
                creator.referralCount = (creator.referralCount || 0) + 1;
                await creator.save();
            }
        }

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'YOUR_JWT_SECRET', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, isPaid: user.isPaid, isCreator: user.isCreator || false, isAdmin: user.isAdmin || false, referralCode: user.referralCode || null} });
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
            user.googleId = googleId; // Update if email matches but googleId was missing
            await user.save();
        } else {
            //new user referlal validation
            let validReferral = null;

            if (referredBy) {
                const refUser = await User.findOne({ referralCode: referredBy });
                if (refUser) {
                    validReferral = referredBy;
                }
            }

            user = new User({
                name,
                email,
                googleId,
                referredBy: validReferral
            });

            await user.save();
            //updating the referral count for the creator
            if (validReferral) {
                const creator = await User.findOne({
                    referralCode: validReferral,
                    isCreator: true
                });

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

// --- Forgot Password / OTP Endpoints ---

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log("Forgot password request for:", email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check resend limit (1 min)
        if (user.lastOTPSentAt && (Date.now() - user.lastOTPSentAt.getTime()) < 60000) {
            const waitTime = Math.ceil((60000 - (Date.now() - user.lastOTPSentAt.getTime())) / 1000);
            return res.status(400).json({ message: `Please wait ${waitTime}s before resending OTP` });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 120000; // 2 mins
        user.lastOTPSentAt = Date.now();
        await user.save();

        console.log("Generated OTP:", otp, "for", email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP - RankHance',
            text: `Your OTP for password reset is: ${otp}. It is valid for 2 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        res.json({ message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordOTPExpires: { $gt: Date.now() }
        });
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

// --- Payment Endpoints ---

app.post('/api/payment/create-order', auth, async (req, res) => {
    try {
        const options = {
            amount: 9900, // ₹99 in paise
            currency: "INR",
            receipt: "receipt_" + req.user.id,
        };
        const order = await razorpay.orders.create(options);
        
        // Store order ID in user document
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
        // Fetch user to check stored order ID
        const user = await User.findById(req.user.id);
        if (!user || user.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: "Invalid order ID or session mismatch" });
        }
        if (user.isPaid) {
        return res.json({ success: true, message: "Already verified" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }
            // ✅ Update payment status
            user.isPaid = true;
            user.razorpayOrderId = undefined;

            // ✅ REFERRAL LOGIC (IMPORTANT)
            if (user.referredBy) {
                const creator = await User.findOne({ referralCode: user.referredBy, isCreator: true });

                if (creator && creator.email !== user.email) { // Prevent self-referral
                    creator.paidReferrals =(creator.paidReferrals || 0)+ 1;
                    const commission = 0.1; // 10% commission
                    const price = 99; // ₹99 subscription price
                    creator.earnings = (creator.earnings || 0)+Math.floor(commission*price); // 💰 commission

                    await creator.save();
                    console.log("updated creator", creator.email);
                }
            }

            // ✅ Save updated user
            await user.save();
                    
        res.json({ success: true });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Server error during verification" });
    }
});

// --- Content Endpoints ---

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
        } catch(e) {}
    }

    if (chapterType.startsWith('chapters')) {
        let data = readJsonFile(`${chapterType}/${subjectId}/data.json`);
        if (!data) {
            data = readJsonFile(`chapter-names/${subjectId}/data.json`) || readJsonFile(`chapters_formulas/${subjectId}/data.json`) || readJsonFile(`chapters_practice/${subjectId}/data.json`);
        }
        
        if (data) {
            const processedData = data.map((ch, idx) => ({
                ...ch,
                locked: !paid && idx >= 2
            }));
            return res.json(processedData);
        } else {
            return res.status(404).json({ message: "Subject not found" });
        }
    }
    next();
});

app.get('/api/questions/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    const data = readJsonFile(`2-Chapter Practice-questions/${subjectId}/${chapterId}/data.json`);
    res.json(data || []);
});

app.get('/api/quiz/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    const data = readJsonFile(`1-quiz-questions/${subjectId}/${chapterId}/data.json`);
    res.json(data || []);
});

app.get('/api/mocktests', async (req, res) => {
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch(e) {}
    }

    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        res.json(data.map((t, idx) => ({ 
            id: t.id, 
            name: t.name, 
            duration: t.duration, 
            totalQuestions: t.totalQuestions, 
            distribution: t.distribution,
            locked: !paid && idx >= 2
        })));
    } else {
        res.json([]);
    }
});

app.get('/api/mocktest/:testId', async (req, res) => {
    const { testId } = req.params;
    const token = req.header('x-auth-token');
    let paid = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');
            const user = await User.findById(decoded.user.id);
            if (user) paid = user.isPaid;
        } catch(e) {}
    }
    
    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        const testIdx = data.findIndex(t => t.id === testId);
        const test = data[testIdx];
        if (test) {
            if (!paid && testIdx >= 2) {
                return res.status(403).json({ message: "Content locked. Please upgrade to premium." });
            }
            const questions = readJsonFile(`3-mocktests-questions/${testId}/data.json`);
            test.questions = questions || [];
            return res.json(test);
        }
    }
    res.status(404).json({ message: "Mock test not found" });
});

app.get('/api/weightage', (req, res) => {
    const data = readJsonFile('weightage/data.json');
    res.json(data || []);
});

// CREATOR DASHBOARD API

app.get('/api/creator/dashboard', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // ❌ Not creator
        if (!user || !user.isCreator) {
            return res.status(403).json({ message: "Access denied" });
        }

        // ✅ Get all users referred by this creator
        const referrals = await User.find({
            referredBy: user.referralCode
        }).select('name email isPaid createdAt');

        res.json({
            referralCode: user.referralCode,
            totalReferrals: referrals.length,
            paidReferrals: referrals.filter(u => u.isPaid).length,
            earnings: user.earnings || 0,
            referrals
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

    //admin dashboard API

app.get('/api/admin/dashboard', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // USERS
    const totalUsers = await User.countDocuments();
    const paidUsers = await User.countDocuments({ isPaid: true });
    const freeUsers = totalUsers - paidUsers;

    const totalRevenue = paidUsers * 99;

    // CREATORS
    const creators = await User.find({ isCreator: true });

    const totalCreators = creators.length;

    const totalCommission = creators.reduce(
      (sum, c) => sum + (c.earnings || 0),
      0
    );

    const totalReferrals = creators.reduce(
      (sum, c) => sum + (c.referralCount || 0),
      0
    );

    const totalPaidReferrals = creators.reduce(
      (sum, c) => sum + (c.paidReferrals || 0),
      0
    );

    // USERS LIST
    const users = await User.find()
      .select('name email isPaid referredBy createdAt');

    // CREATORS LIST
    const creatorList = await User.find({ isCreator: true })
      .select('name email referralCode earnings referralCount paidReferrals');

    res.json({
      usersStats: {
        totalUsers,
        paidUsers,
        freeUsers,
        totalRevenue
      },
      creatorStats: {
        totalCreators,
        totalCommission,
        totalReferrals,
        totalPaidReferrals
      },
      users,
      creators: creatorList
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
