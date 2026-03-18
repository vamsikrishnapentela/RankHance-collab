import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft } from 'lucide-react';
import Button from './components/Button';
import { getMockTests } from './api';

export default function MockTests() {
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



  if (loading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-5xl mx-auto py-8 flex justify-center">
          <div className="text-lg font-medium text-gray-500">Loading mock tests...</div>
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex-1 text-center sm:text-left">
            Full Length Mock Exams
          </h1>
        </div>
        <p className="text-lg font-medium text-gray-600 mb-12 text-center sm:text-left max-w-2xl">
          Practice with real EAMCET exam pattern and improve your score
        </p>
        
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
            {mockTests.map((test) => (
              <div key={test.id} className="card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform group shadow-md hover:shadow-xl w-full">
                <div className="p-4 rounded-2xl bg-orange-50 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {test.totalQuestions} Questions · {test.duration} mins
                  </p>
                </div>
                <div className="mt-auto pt-4 flex w-full justify-between items-center">
                  <span className="font-bold text-[var(--color-primary)]">Attempt</span>
                  <span 
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-sm cursor-pointer group-hover:-translate-y-0.5"
                    onClick={() => navigate(`/mock/${test.id}`)}
                  >
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

