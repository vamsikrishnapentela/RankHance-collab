import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Container from './components/Container';
import PaymentModal from './components/PaymentModal';
import { ArrowLeft, Video, Calendar, Clock, MapPin, Users, Target, BookOpen, GraduationCap } from 'lucide-react';

export default function LiveSessions() {
  const { user, logout, isPaid } = useAuth();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const sessions = [
    {
      id: 1,
      title: "Session 1: Before Exam Mentorship",
      status: "Upcoming",
      icon: <Target className="w-8 h-8 text-orange-500" />,
      topics: [
        "How to prepare well for EAMCET",
        "Smart strategies to enhance your marks easily",
        "Time management during the final days",
        "Live Q&A with Toppers & Content Creators"
      ],
      presenters: "EAMCET Toppers & Content Creators",
      date: "Will be announced soon",
      time: "Will be announced soon",
      meetLink: "#", // Update Google Meet link here later
      bgClass: "bg-orange-50/50",
      borderClass: "border-orange-100",
      btnClass: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
    },
    {
      id: 2,
      title: "Session 2: Post-Exam Counselling Guide",
      status: "Upcoming",
      icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
      topics: [
        "How to select the best college and branch",
        "Complete overview of the counselling process",
        "Understanding seat matrix and allotments",
        "Live Q&A with Toppers & Content Creators"
      ],
      presenters: "EAMCET Toppers & Content Creators",
      date: "Will be announced soon",
      time: "Will be announced soon",
      meetLink: "#", // Update Google Meet link here later
      bgClass: "bg-blue-50/50",
      borderClass: "border-blue-100",
      btnClass: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
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
          
          {/* Header */}
          <div className="mb-10 flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                Special Live Sessions <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
              </h1>
              <p className="text-gray-500 mt-1">Join exclusive, high-value live events hosted by EAMCET toppers and our creators.</p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sessions.map((session) => (
              <div key={session.id} className={`flex flex-col bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${session.borderClass}`}>
                
                {/* Card Header area */}
                <div className={`p-6 md:p-8 ${session.bgClass} border-b ${session.borderClass}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      {session.icon}
                    </div>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600 shadow-sm border border-gray-100">
                      {session.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{session.title}</h2>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex-1 flex flex-col space-y-6">
                  
                  {/* Meta Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">Date</p>
                        <p>{session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">Time</p>
                        <p>{session.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Presenters</p>
                      <p>{session.presenters}</p>
                    </div>
                  </div>

                  {/* Topics Covered */}
                  <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-500" /> What we will cover:
                    </h3>
                    <ul className="space-y-2">
                      {session.topics.map((topic, index) => (
                        <li key={index} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-orange-500 font-bold">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Link */}
                  <a 
                    href={session.meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!isPaid) {
                        e.preventDefault();
                        setIsPaymentModalOpen(true);
                      }
                    }}
                    className={`mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${session.btnClass}`}
                  >
                    <Video className="w-5 h-5" /> {isPaid ? 'Join Live Meet' : 'Unlock to Join 🔒'}
                  </a>

                </div>
              </div>
            ))}
          </div>

        </Container>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </>
  );
}
