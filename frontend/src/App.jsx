import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Practice from './Practice';
import MockTests from './MockTests';
import MockAttempt from './MockAttempt';
import Result from './Result';
import Review from './Review';
import Subjects from './Subjects';
import Chapters from './Chapters';
import Questions from './Questions';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import PaymentModal from './components/PaymentModal';
import { useAuth } from './hooks/useAuth';
import Terms from './Terms';
import Privacy from './Privacy';
import Refund from './Refund';   
import Contact from './Contact';
import CreatorDashboard from './CreatorDashboard';
import AdminDashboard from './AdminDashboard';
import MyAttempts from './MyAttempts';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isPaid, loading } = useAuth();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  const [showProfile, setShowProfile] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      localStorage.setItem("referral", ref);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/features', '/pricing', '/terms', '/privacy', '/contact', '/refund'];
    const isMockAttemptPage = location.pathname.startsWith('/mock-attempt/');
    const testIdMatch = location.pathname.match(/\/mock-attempt\/([^/]+)/);
    const testId = testIdMatch ? testIdMatch[1] : null;
    const savedAttempt = testId ? localStorage.getItem(`mockattempt-${testId}`) : null;

    // Don't redirect while loading auth
    if (loading) return;

    // Allow mock attempts with saved progress
    if (isMockAttemptPage && savedAttempt) return;

    // Redirect if not authenticated and not on public page
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, loading, location.pathname, navigate]);

  const smoothScrollTo = (targetId, duration = 1000) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const start    = window.scrollY;
    const end      = target.offsetTop - 80;
    const distance = end - start;
    let startTime  = null;
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOut(progress));
      if (elapsed < duration) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  };

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col items-center w-full">
      {!isAuthPage && (
        <>
          <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md h-16 z-50 border-b border-gray-100 flex items-center px-6">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="text-2xl font-bold font-heading">
                <span className="text-gray-900">Rank</span>
                <span className="text-[var(--color-primary)]">Hance</span>
              </Link>

              {/* Nav items */}
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                      Dashboard
                    </Link>

                    {/* ── My Attempts button ─────────────────────────────── */}
                    <Link
                      to="/my-attempts"
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname === '/my-attempts'
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      My Attempts
                    </Link>

                    {/* ── Profile dropdown ───────────────────────────────── */}
                    <div className="relative" ref={profileRef}>
                      <button
                        onClick={() => setShowProfile(prev => !prev)}
                        className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow hover:scale-105 transition font-heading"
                      >
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </button>

                      {showProfile && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                          {/* Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-semibold text-gray-900">{user.name}</span>
                              <span className="text-sm text-gray-500 break-words">{user.email}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 my-3" />

                          {/* Plan badge */}
                          <div>
                            {isPaid ? (
                              <span className="inline-flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full">
                                💎 Premium User
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-orange-500 font-medium text-sm bg-orange-50 px-3 py-1 rounded-full">
                                🔒 Free User
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 space-y-3">
                            {/* My Attempts inside dropdown too */}
                            <button
                              onClick={() => { setShowProfile(false); navigate('/my-attempts'); }}
                              className="w-full bg-gray-50 text-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition font-heading text-left px-4 flex items-center gap-2"
                            >
                              📋 My Attempts
                            </button>

                            {!isPaid && (
                              <button
                                onClick={() => { setShowProfile(false); setIsPaymentModalOpen(true); }}
                                className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition shadow-sm hover:shadow-md font-heading"
                              >
                                Upgrade 🚀
                              </button>
                            )}

                            <button
                              onClick={() => { setShowProfile(false); navigate('/forgot-password'); }}
                              className="w-full bg-gray-100 text-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition font-heading"
                            >
                              Change Password
                            </button>

                            <button
                              onClick={() => { logout(); navigate('/'); }}
                              className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-semibold hover:bg-black transition font-heading"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">
                      Login
                    </Link>
                    <button
                      onClick={() => smoothScrollTo('features', 1800)}
                      className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                      Features
                    </button>
                    <button
                      onClick={() => smoothScrollTo('pricing', 1800)}
                      className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                      Pricing
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Marquee banner */}
          <div className="fixed top-16 w-full z-40 bg-orange-400 text-white text-base font-semibold overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee gap-14 py-3 items-center">
              <div className="flex whitespace-nowrap gap-12">
                <span>🔥 1200+ EAMCET Aspirants Already Preparing with RankHance</span>             
                <span>🎯 Chapter-wise Practice + Real Exam Level Questions</span>              
                <span>📈 Students Improving 30–50 Marks with Smart Analysis</span>              
                <span>🚀 Full Length Mock Tests (160 Questions) Like Real Exam</span>  
                <span>📊 Identify Weak Areas &amp; Improve Faster</span> 
                <span>💥 One-Time payment — No hidden charges</span>
                <span>⏳ Limited Time Offer — Price May Increase Soon</span>
              </div>
              <div className="flex whitespace-nowrap gap-12">
                <span>🔥 1200+ EAMCET Aspirants Already Preparing with RankHance</span>             
                <span>🎯 Chapter-wise Practice + Real Exam Level Questions</span>              
                <span>📈 Students Improving 30–50 Marks with Smart Analysis</span>              
                <span>🚀 Full Length Mock Tests (160 Questions) Like Real Exam</span>  
                <span>📊 Identify Weak Areas &amp; Improve Faster</span> 
                <span>💥 One-Time payment — No hidden charges</span>
                <span>⏳ Limited Time Offer — Price May Increase Soon</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={`${!isAuthPage ? 'pt-24' : ''} w-full flex-1 flex flex-col relative`}>
        <Routes>
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/practice"       element={<Practice />} />
          <Route path="/subjects"       element={<Subjects />} />
          <Route path="/chapters/:subject" element={<Chapters />} />
          <Route path="/questions/:subject/:chapter" element={<Questions />} />
          <Route path="/mock-tests"     element={<MockTests />} />
          <Route path="/mock/:id"       element={<MockAttempt />} />
          <Route path="/result"         element={<Result />} />
          <Route path="/review"         element={<Review />} />
          <Route path="/my-attempts"    element={<MyAttempts />} />
          <Route path="/terms"          element={<Terms />} />
          <Route path="/privacy"        element={<Privacy />} />
          <Route path="/refund"         element={<Refund />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/creator"        element={<CreatorDashboard />} />
          <Route path="/admin"          element={<AdminDashboard />} />
        </Routes>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}