import { useState } from 'react';
import { createOrder, verifyPayment } from '../api';
import { useAuth } from '../hooks/useAuth';
import { X, ShieldCheck, Zap, Star } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const PaymentModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      onClose();
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const order = await createOrder();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'RankHance Premium',
        description: 'Unlock all chapters and mock tests',
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);
            console.log('Payment verified successfully');
            alert('Payment Successful! Reloading...');
            await refreshUser();
            window.location.reload(); // Force full refresh
            onClose();
            setIsProcessing(false);
          } catch (err) {
            console.error('Verify error:', err);
            alert(`Payment verification failed: ${err.message || err}`);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#FF5C1A'
        }
      };

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        options.callback_url = `${baseUrl}/api/payment/verify-redirect?frontend=${encodeURIComponent(window.location.origin)}`;
        options.redirect = true;
      }

      options.modal = {
        ondismiss: function() {
          setIsProcessing(false);
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function() {
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-7 h-7 text-orange-500 fill-orange-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{user?.isPaid ? "Premium Unlocked!" : "Unlock Premium Access"}</h2>
            <p className="text-gray-600">
              {user?.isPaid 
                ? "You already have full access to all RankHance Premium features. Happy learning!" 
                : "Get unlimited access to all chapters, mock tests, and performance analysis."}
            </p>
          </div>

          {!user?.isPaid ? (
            <>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">Full-Length Mock Tests (160 Questions)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">Performance Tracking & Detailed Analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">Weightage-Based Exam Insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">Chapter-Wise Structured Practice</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">2 Special Live Guidance Sessions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✔</span>
                  <span className="text-sm font-semibold text-gray-700">Complete AP & TS Syllabus Coverage</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 line-through text-lg">₹999</span>
                  <span className="text-4xl font-extrabold text-gray-900">₹99</span>
                </div>
                <Button variant="primary" className="w-full h-12 md:h-14 text-base md:text-lg" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Pay Now & Unlock'}
                </Button>
                <p className="text-xs text-gray-400">One-time payment • Access up to your college joining date</p>
              </div>
            </>
          ) : (
            <div className="py-8">
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-200 font-semibold mb-6">
                <ShieldCheck className="w-6 h-6 inline-block mr-2" />
                Your Premium subscription is active!
              </div>
              <Button variant="secondary" className="w-full" onClick={onClose}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
