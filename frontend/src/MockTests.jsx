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
  }, [isPaid]);

  const handleTestClick = (test, idx) => {
    const isLocked = !isPaid && idx >= 2;
    if (isLocked) {
      setIsPaymentModalOpen(true);
      return;
    }
    navigate(`/mock/${test.id}`);
  };

  if (loading || authLoading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-5xl mx-auto py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)] overflow-y-auto">
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
        
        {error ? (
          <div className="text-center text-red-500 font-bold py-20 bg-red-50 rounded-xl px-6">
            {error}
          </div>
        ) : mockTests.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-200">
            No mock tests available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTests.map((test, idx) => {
              const isLocked = !isPaid && idx >= 2;
              return (
                <div 
                  key={test.id} 
                  className={`card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform group shadow-md hover:shadow-xl w-full cursor-pointer ${isLocked ? 'opacity-85' : ''}`}
                  onClick={() => handleTestClick(test, idx)}
                >
                  <div className="p-4 rounded-2xl bg-orange-50 group-hover:scale-110 transition-transform">
                    {isLocked ? <Lock className="w-8 h-8 text-orange-500" /> : <Edit3 className="w-8 h-8 text-orange-500" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      {test.name}
                      {isLocked && <Lock className="w-4 h-4 text-orange-400" />}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                      {test.totalQuestions} Questions · {test.duration} mins
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex w-full justify-between items-center text-[var(--color-primary)] font-bold">
                    <span>{isLocked ? 'Unlock' : 'Attempt'}</span>
                    <span className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-sm">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}

