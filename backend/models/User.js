const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  isPaid: { type: Boolean, default: false },
  razorpayOrderId: { type: String },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },
  lastOTPSentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
