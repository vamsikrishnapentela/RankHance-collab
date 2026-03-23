import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from './components/Container';
import PaymentModal from './components/PaymentModal';
import { ArrowLeft, ExternalLink, Calculator, Atom, FlaskConical } from 'lucide-react';

export default function Weightage() {
  const { user, logout, isPaid } = useAuth();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // The user can inject their 3 drive links here later.
  const driveLinks = {
    maths: "https://drive.google.com/file/d/1Tx7rHYIU1u3oxTt7MDsn13AIWNSpnvhk/view?usp=drive_link",      // INSERT MATHS DRIVE LINK HERE
    physics: "https://drive.google.com/file/d/1E67VADKPrrG_somZMU8xrwWxmFDgbbnA/view?usp=drive_link",    // INSERT PHYSICS DRIVE LINK HERE
    chemistry: "https://drive.google.com/file/d/1ULdPBNJ7XlwpV1Z3i5iLckx5s9wnaFlG/view?usp=drive_link"   // INSERT CHEMISTRY DRIVE LINK HERE
  };

  const subjects = [
    {
      id: 'maths',
      name: 'Mathematics',
      description: 'Chapter-wise weightage for Maths',
      icon: <Calculator className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform" />,
      link: driveLinks.maths,
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    },
    {
      id: 'phy',
      name: 'Physics',
      description: 'Chapter-wise weightage for Physics',
      icon: <Atom className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />,
      link: driveLinks.physics,
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      id: 'che',
      name: 'Chemistry',
      description: 'Chapter-wise weightage for Chemistry',
      icon: <FlaskConical className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />,
      link: driveLinks.chemistry,
      bg: 'bg-green-50',
      border: 'border-green-100'
    }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md h-16 z-50 border-b border-gray-100 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold font-heading">
            <span className="text-gray-900">Rank</span>
            <span className="text-[var(--color-primary)]">Hance</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">Dashboard</Link>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold font-heading text-sm hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 flex-1 w-full bg-gray-50 px-6 min-h-screen">
        <Container className="max-w-5xl mx-auto">

          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Weightage Analysis</h1>
              <p className="text-gray-500 mt-1">Select a subject to view its important chapters and exam weightage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <a
                key={sub.id}
                href={sub.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isPaid) {
                    e.preventDefault();
                    setIsPaymentModalOpen(true);
                  }
                }}
                className={`group block p-8 rounded-3xl bg-white border-2 border-transparent shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 relative overflow-hidden`}
              >
                <div className="absolute top-4 right-4 text-gray-300 group-hover:text-orange-500 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>

                <div className={`w-20 h-20 rounded-2xl ${sub.bg} border ${sub.border} flex items-center justify-center mb-6`}>
                  {sub.icon}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{sub.name}</h2>
                <p className="text-gray-500 font-medium">{sub.description}</p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-orange-500 uppercase tracking-wide">
                  <span>Open Document</span>
                  <div className="w-6 h-[2px] bg-orange-500 group-hover:w-10 transition-all duration-300"></div>
                </div>
              </a>
            ))}
          </div>

        </Container>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </>
  );
}
