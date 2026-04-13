const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
  googleId: { type: String },
  isPaid: { type: Boolean, default: false },
  // For referral system
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  isCreator: { type: Boolean, default: false },
  referralCount: { type: Number, default: 0 },    // all signups
  paidReferrals: { type: Number, default: 0 },    // paid users
  earnings: { type: Number, default: 0 },
  commissionRate: { type: Number },
  //admin fields
  isManager: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },

  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },
  lastOTPSentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
