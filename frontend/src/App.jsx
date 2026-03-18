import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Practice from './Practice';
import MockTests from './MockTests';
import MockAttempt from './MockAttempt';
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
