import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from './api';
import Button from './components/Button';
import Container from './components/Container';
import { Mail, Lock, ArrowRight, Loader2, Key, CheckCircle, Timer } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer states
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    let interval;
    if (otpExpiryTimer > 0) {
      interval = setInterval(() => setOtpExpiryTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpExpiryTimer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setMessage('OTP sent to your email.');
      setStep(2);
      setResendTimer(60); // 1 minute
      setOtpExpiryTimer(120); // 2 minutes
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 flex-1 flex flex-col justify-center py-12 px-6 lg:px-8 bg-gray-50 min-h-screen">
      <Container className="max-w-md">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
            </h2>
            <p className="text-gray-500 font-medium">
              {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the 6-digit code sent to your email' : 'Create a new secure password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 animate-in shake-1 duration-300">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-semibold border border-green-100 animate-in fade-in duration-300">
              {message}
            </div>
          )}

          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOTP}>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg">
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOTP}>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">One-Time Password (OTP)</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium tracking-[0.5em] text-center"
                    placeholder="000000"
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 mt-2 px-1">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                  Expires in: {Math.floor(otpExpiryTimer / 60)}:{(otpExpiryTimer % 60).toString().padStart(2, '0')}
                  </span>
                  {resendTimer > 0 ? (
                    <span>Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOTP} className="text-orange-500 hover:text-orange-600 underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || otpExpiryTimer <= 0} className="w-full h-14 text-lg">
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg">
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="text-orange-500 font-bold hover:text-orange-600 text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
