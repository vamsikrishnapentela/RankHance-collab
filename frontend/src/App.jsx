import { useEffect } from 'react';
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
import { useAuth } from './hooks/useAuth';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Protected routes logic
  useEffect(() => {
    const publicPaths = ['/', '/login', '/signup'];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col items-center w-full">
      {!isAuthPage && (
        <>
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
          <div className="fixed top-16 w-full z-40 bg-orange-400 text-white text-base font-semibold overflow-hidden">
<div className="flex whitespace-nowrap animate-marquee gap-12 py-2.5 items-center">
              <div>
                <span>🔥 1000+ EAMCET Students Already Joined</span>
                <span>•</span>
                <span>🚀 Crack EAMCET 2026 with Smart Practice</span>
                <span>•</span>
                <span>⏳ Limited Time Offer ₹99 Only</span>
              </div>
              <div>
                <span>🔥 1000+ EAMCET Students Already Joined</span>
                <span>•</span>
                <span>🚀 Crack EAMCET 2026 with Smart Practice</span>
                <span>•</span>
                <span>⏳ Limited Time Offer ₹99 Only</span>
              </div>
            </div>
          </div>
        </>
      )}
      <div className={`${!isAuthPage ? 'pt-24' : ''} w-full flex-1 flex flex-col relative`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/chapters/:subject" element={<Chapters />} />
          <Route path="/questions/:subject/:chapter" element={<Questions />} />
          <Route path="/mock-tests" element={<MockTests />} />
          <Route path="/mock/:id" element={<MockAttempt />} />
          <Route path="/result" element={<Result />} />
          <Route path="/review" element={<Review />} />
        </Routes>
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
