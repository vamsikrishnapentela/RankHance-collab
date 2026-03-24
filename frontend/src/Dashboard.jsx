import React, { useState, useEffect } from 'react';
import PaymentModal from './components/PaymentModal';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { BookOpen, Zap, Lock, Edit3, ChevronRight, MessageSquare, PieChart, Video, Building } from 'lucide-react';
import Card from './components/Card';


export default function Dashboard() {
  const { isPaid } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const shouldShowPayment = localStorage.getItem("showPayment");

    if (shouldShowPayment === "true") {
      setIsPaymentModalOpen(true);
      localStorage.removeItem("showPayment");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      alert('Payment Successful! Premium Content Unlocked.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus?.startsWith('failed')) {
      alert('Payment Failed or could not be verified. If amount was deducted, please contact support.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const cards = [
    {
      title: 'Foundation Practice',
      description: 'Build strong basics chapter by chapter',
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      link: '/subjects?type=quiz',
      active: true,
      color: 'bg-orange-100'
    },
    {
      title: 'Exam Questions Practice ',
      description: 'Solve real exam questions chapter by chapter',
      icon: <BookOpen className="w-8 h-8 text-orange-500" />,
      link: '/subjects?type=practice',
      active: true,
      color: 'bg-orange-100'
    },

    {
      title: 'Mock Test',
      description: 'Attempt 160-question mock tests like EAPCET',
      icon: <Edit3 className="w-8 h-8 text-orange-500" />,
      link: '/mock-tests',
      active: true,
      color: 'bg-orange-100'
    },

    {
      title: 'Weightage Analysis',
      description: 'Check chapter-wise weightage for EAMCET',
      icon: <PieChart className="w-8 h-8 text-orange-500" />,
      link: '/weightage',
      active: true,
      color: 'bg-orange-100'
    },
    {
      title: 'Special Live Session',
      description: 'Join live mentorship & counselling sessions',
      icon: <Video className="w-8 h-8 text-orange-500" />,
      link: '/live-sessions',
      active: true,
      color: 'bg-orange-100'
    },
    {
      title: 'College Predictor',
      description: 'Find the best colleges based on your rank',
      icon: <Lock className="w-8 h-8 text-gray-400" />,
      link: '#',
      active: false,
      color: 'bg-gray-100'
    }
  ];
  if (isPaymentModalOpen) {
    return (
      <PaymentModal
        isOpen={true}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    );
  }
  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)] overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 w-full text-center tracking-tight">
          Welcome! What do you want to practice today?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            if (card.active) {
              const isLocked = card.requiresPayment && !isPaid;

              const CardContent = (
                <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full">
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-6 justify-between h-full p-4 md:p-6">
                    <div className={`p-3 md:p-4 rounded-xl ${card.color} group-hover:scale-110 transition-transform shrink-0`}>
                      {React.cloneElement(card.icon, { className: 'w-6 h-6 md:w-8 md:h-8 ' + card.icon.props.className.split(' ').slice(2).join(' ') })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2 truncate md:whitespace-normal">{card.title}</h3>
                      <p className="text-xs md:text-sm font-medium text-gray-500 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none">{card.description}</p>
                    </div>
                    <div className="mt-0 md:mt-6 pt-0 md:pt-4 flex w-auto md:w-full justify-end md:justify-between items-center text-[var(--color-primary)] font-bold shrink-0">
                      <span className="hidden md:block">{isLocked ? 'Unlock Now 🔒' : 'Start'}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              );

              return isLocked ? (
                <div key={index} onClick={() => setIsPaymentModalOpen(true)} className="cursor-pointer h-full">
                  {CardContent}
                </div>
              ) : (
                <Link key={index} to={card.link} className="block h-full">
                  {CardContent}
                </Link>
              );
            } else {
              return (
                <div
                  key={index}
                  className="card p-4 md:p-6 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-4 opacity-75 grayscale cursor-not-allowed w-full shadow-sm"
                >
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${card.color} shrink-0`}>
                    {React.cloneElement(card.icon, { className: 'w-6 h-6 md:w-8 md:h-8 ' + card.icon.props.className.split(' ').slice(2).join(' ') })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-gray-400 mb-0.5 md:mb-2 truncate md:whitespace-normal">{card.title}</h3>
                    <p className="text-xs md:text-sm font-medium text-gray-400 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none">{card.description}</p>
                  </div>
                  <div className="mt-0 md:mt-auto pt-0 md:pt-4 flex w-auto md:w-full justify-end md:justify-between items-center text-gray-400 font-bold shrink-0">
                    <span className="text-[10px] md:text-base px-2 py-1 md:px-0 md:py-0 bg-gray-100 md:bg-transparent rounded-lg">Coming soon</span>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Separate Support section at bottom */}
        <div className="mt-12">
          <Link to="/support" className="block w-full group">
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Need Help? Contact Support</h3>
                  <p className="text-gray-600 font-medium text-sm md:text-base">Report issues, clarify doubts, or ask questions instantly.</p>
                </div>
              </div>
              <div className="w-full md:w-auto flex bg-white px-6 py-3 rounded-xl shadow-sm text-blue-600 font-bold items-center justify-center gap-2">
                Support Desk <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
