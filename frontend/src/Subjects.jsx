import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './components/Button';
import Card from './components/Card';
import Container from './components/Container';
import { getSubjects } from './api';

export default function Subjects() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'practice';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setError('');
        const data = await getSubjects();
        setSubjects(data || []);
      } catch {
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
      <Container>
        <Button 
          variant="secondary" 
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          Back to Dashboard
        </Button>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight text-center">
          Choose a Subject ({type.toUpperCase()})
        </h2>
        
        {error ? (
          <Card className="text-center text-red-500 py-10 bg-red-50">
            {error}
          </Card>
        ) : subjects.length === 0 ? (
          <Card className="text-center text-gray-500">
            No subjects available.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map(sub => {
              const emojis = {
                maths: '📐',
                phy: '⚛️',
                che: '🧪'
              };
              const colors = {
                maths: 'bg-blue-500',
                phy: 'bg-purple-500',
                che: 'bg-green-500'
              };

              return (
                <Card key={sub.id} className={`flex flex-col items-center justify-center p-10 shadow-lg border-0 text-white ${colors[sub.id]}`}>
                  <h3 className="text-3xl font-bold tracking-wide mb-4 text-[var(--color-primary)]">{sub.name}</h3>
                  <span className="text-5xl">{emojis[sub.id] || '📚'}</span>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate(`/chapters/${sub.id}?type=${type}`)}
                    className="mt-6 w-full"
                  >
                    Start {sub.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

