import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Button from './components/Button';
import Container from './components/Container';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, googleLogin, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    /* global google */
    const initGoogleSignIn = () => {
      if (window.google) {
        // Prevent multiple initializations to stop console warnings
        try {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
            callback: handleGoogleCallback,
            auto_select: false,
          });
          google.accounts.id.renderButton(
            document.getElementById("googleSignUpDiv"),
            { theme: "outline", size: "large", width: "100%", text: "signup_with" }
          );
        } catch (e) {
          console.warn("Google Auth already initialized or failed:", e);
        }
      }
    };

    if (window.google) {
      initGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogleSignIn();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setIsSubmitting(true);
      await googleLogin(response.credential);
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const userData = await register({ name, email, phone, password });

      if (userData.isSuperAdmin) {
        navigate('/admin999k');
      } else if (userData.isManager) {
        navigate('/manager999k');
      } else if (userData.isCreator) {
        navigate('/creator');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md h-16 z-50 border-b border-gray-100 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold font-heading">
            <span className="text-gray-900">Rank</span>
            <span className="text-[var(--color-primary)]">Hance</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">Dashboard</Link>
                <button 
                  onClick={logout}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold font-heading text-sm hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">Login</Link>
                <Link 
                  to="/" 
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold font-heading text-sm hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Home
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Fixed Announcement Bar */}
      <div className="fixed top-16 w-full z-40 bg-orange-400 text-white text-base font-semibold overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee gap-14 py-3 items-center">
              <div className="flex whitespace-nowrap gap-12">
                <span>🔥 1200+ EAMCET Aspirants Already Preparing with RankHance</span>             
                <span>🎯 Chapter-wise Practice + Real Exam Level Questions</span>              
                <span>📈 Students Improving 30–50 Marks with Smart Analysis</span>              
                <span>🚀 Full Length Mock Tests (160 Questions) Like Real Exam</span>  
                <span>📊 Identify Weak Areas & Improve Faster</span> 
                <span>💥 One-Time payment  — No hidden charges</span>
                <span>⏳ Limited Time Offer — Price May Increase Soon</span>
              </div>
              <div className="flex whitespace-nowrap gap-12">
                <span>🔥 1200+ EAMCET Aspirants Already Preparing with RankHance</span>             
                <span>🎯 Chapter-wise Practice + Real Exam Level Questions</span>              
                <span>📈 Students Improving 30–50 Marks with Smart Analysis</span>              
                <span>🚀 Full Length Mock Tests (160 Questions) Like Real Exam</span>  
                <span>📊 Identify Weak Areas & Improve Faster</span> 
                <span>💥 One-Time payment — No hidden charges</span>
                <span>⏳ Limited Time Offer — Price May Increase Soon</span>
              </div>
          </div>
        </div>
            
      <div className="pt-28 flex-1 flex flex-col justify-center gap-8 py-12 px-6 lg:px-8 bg-gray-50">
        <Container className="max-w-md">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight gap">Create Account</h2>
              <p className="text-gray-500 font-medium">Join RankHance and start practicing</p>
            </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 animate-in shake-1 duration-300">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-gray-100 focus:border-orange-500 focus:outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg"
              rightIcon={isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium uppercase tracking-wider">or</span>
            </div>
          </div>

          <div id="googleSignUpDiv" className="w-full"></div>

          <p className="text-center text-gray-500 font-medium pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-bold hover:text-orange-600 underline underline-offset-4">
              Log In
            </Link>
          </p>
        </div>
      </Container>
      </div>
  </>
  );
}
