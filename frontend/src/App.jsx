import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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

function AppLayout() {
  const location = useLocation();
  const showNavButton = location.pathname === '/';

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col items-center w-full">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md h-16 z-50 border-b border-gray-100 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold font-heading">
            <span className="text-gray-900">Rank</span>
            <span className="text-[var(--color-primary)]">Hance</span>
          </Link>
          {showNavButton && (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold font-heading text-sm hover:bg-orange-600 transition-colors shadow-sm"
            >
              Start Practicing
            </Link>
          )}
        </div>
      </nav>
      <div className="sticky top-[64px] z-40 bg-orange-400 text-white text-base font-semibold overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-12 py-2.5 items-center">
          <span>🔥 1000+ EAMCET Students Already Joined — Don't Miss Your Chance</span>
          <span>•</span>
          <span>🚀 Crack EAMCET 2026 with Smart Practice, Mock Tests & Real Exam Questions</span>
          <span>•</span>
          <span>⏳ Limited Time Offer ₹99 Only — Price Will Increase Soon</span>
          <span>•</span>
          <span>📈 Improve Your Rank with Daily Practice & Chapter-wise Preparation</span>
          <span>•</span>
          <span>💯 Real Exam Level Questions + Full Length Mock Tests (160 Questions)</span>
          <span>•</span>
          <span>🎯 Complete AP & TS Syllabus Covered — No More Confusion What to Study</span>
          <span>•</span>
          <span>⚡ Only Few Seats Left — Join Now Before It Gets Full</span>
          <span>•</span>
          <span>🏆 Follow Topper Strategies & Boost Your Score Faster</span>
          <span>•</span>
          <span>📚 Practice Like Real Exam — Gain Confidence Before Exam Day</span>
          <span>•</span>
          <span>⏱️ Time is Running Out — Start Preparation Today, Not Tomorrow</span>
          <span>🔥 1000+ EAMCET Students Already Joined — Don't Miss Your Chance</span>
          <span>•</span>
          <span>🚀 Crack EAMCET 2026 with Smart Practice, Mock Tests & Real Exam Questions</span>
          <span>•</span>
          <span>⏳ Limited Time Offer ₹99 Only — Price Will Increase Soon</span>
          <span>•</span>
          <span>📈 Improve Your Rank with Daily Practice & Chapter-wise Preparation</span>
          <span>•</span>
          <span>💯 Real Exam Level Questions + Full Length Mock Tests (160 Questions)</span>
          <span>•</span>
          <span>🎯 Complete AP & TS Syllabus Covered — No More Confusion What to Study</span>
          <span>•</span>
          <span>⚡ Only Few Seats Left — Join Now Before It Gets Full</span>
          <span>•</span>
          <span>🏆 Follow Topper Strategies & Boost Your Score Faster</span>
          <span>•</span>
          <span>📚 Practice Like Real Exam — Gain Confidence Before Exam Day</span>
          <span>•</span>
          <span>⏱️ Time is Running Out — Start Preparation Today, Not Tomorrow</span>
        </div>
      </div>
      <div className="pt-16 w-full flex-1 flex flex-col relative">
        <Routes>
          <Route path="/" element={<Landing />} />
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
