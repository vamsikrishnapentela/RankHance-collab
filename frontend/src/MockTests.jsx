import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft, Lock } from 'lucide-react';
import Button from './components/Button';
import { getMockTests } from './api';
import { useAuth } from './hooks/useAuth';
import PaymentModal from './components/PaymentModal';

export default function MockTests() {
  const { isPaid, loading: authLoading } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('easy');
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMockTests();
        setMockTests(data || []);
      } catch {
        setError('Failed to load mock tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, []);

  const easyTests = mockTests.filter(test => test.id.startsWith('et'));
  const advancedTests = mockTests.filter(test => test.id.startsWith('adv'));
  const currentTests = activeTab === 'easy' ? easyTests : advancedTests;

  const handleTestClick = (test) => {
    let isLocked = false;
    if (test.id.startsWith('adv') || parseInt(test.id.slice(2)) >= 3) {
      isLocked = !isPaid;
    }
    if (isLocked) {
      setIsPaymentModalOpen(true);
      return;
    }
    navigate(`/mock/${test.id}`);
  };

  const renderTestCard = (test) => {
    let isLocked = false;
    if (test.id.startsWith('adv') || parseInt(test.id.slice(2)) >= 3) {
      isLocked = !isPaid;
    }
    return (
      <div 
        key={test.id} 
        className={`card p-4 md:p-6 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-6 hover:-translate-y-1 transition-transform group shadow-md hover:shadow-xl w-full cursor-pointer ${isLocked ? 'opacity-85' : ''}`}
        onClick={() => handleTestClick(test)}
      >


        <div className="p-3 md:p-4 shrink-0 rounded-xl md:rounded-2xl bg-orange-50 group-hover:scale-110 transition-transform">
          {isLocked ? <Lock className="w-6 h-6 md:w-8 md:h-8 text-orange-500" /> : <Edit3 className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />}

        </div>
        <div className="flex-1 min-w-0 md:w-full">
          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-0.5 md:mb-2 flex items-center gap-2 truncate md:whitespace-normal w-full overflow-hidden">
            {test.name}
            {isLocked && <Lock className="w-3 h-3 md:w-4 md:h-4 text-orange-400 shrink-0" />}

          </h3>
          <p className="text-xs md:text-sm font-medium text-gray-500 leading-snug md:leading-relaxed truncate md:whitespace-normal">
            {test.totalQuestions} Qs · {test.duration} mins
          </p>
        </div>
        <div className="mt-0 md:mt-auto pt-0 md:pt-4 flex w-auto md:w-full justify-end md:justify-between items-center text-[var(--color-primary)] font-bold shrink-0">
          <span className="hidden md:block">{isLocked ? 'Unlock' : 'Attempt'}</span>
          <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs md:text-sm hover:bg-orange-600 transition-colors shadow-sm">
            →
          </span>
        </div>
      </div>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)]">
        <div className="w-full max-w-5xl mx-auto py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  const tabClass = (tab) => `px-6 py-3 font-bold rounded-xl text-sm transition-all ${
    activeTab === tab 
      ? 'bg-orange-500 text-white shadow-lg' 
      : 'bg-white text-gray-600 hover:text-gray-900 hover:shadow-md border border-gray-200'
  }`;

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)] overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto py-8">
        <Button 
          variant="secondary" 
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          Back to Dashboard
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-200 px-3 py-1 rounded-full">
            Mock Tests
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex-1 sm:text-left text-center">
            Full Length Mock Exams
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
          <button 
            className={tabClass('easy')}
            onClick={() => setActiveTab('easy')}
          >
            Easy ({easyTests.length} quizzes)
          </button>
          <button 
            className={tabClass('advanced')}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced ({advancedTests.length} practice)
          </button>
        </div>

        {error ? (
          <div className="text-center text-red-500 font-bold py-20 bg-red-50 rounded-xl px-6">
            {error}
          </div>
        ) : currentTests.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-200">
            No mock tests available for this category.
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              {activeTab === 'easy' ? 'Easy Tests' : 'Advanced Practice Tests'} <span className="text-sm text-gray-400 font-normal">({currentTests.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTests.map((test, idx) => renderTestCard(test, idx))}
            </div>
          </div>
        )}
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
