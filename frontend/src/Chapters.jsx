import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getChapters } from './api';

export default function Chapters() {
  const { subject: subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'practice';

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const subjectNames = {
    maths: 'Mathematics',
    phy: 'Physics',
    che: 'Chemistry'
  };

  const subjectName = subjectNames[subjectId] || subjectId;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setError('');
        const data = await getChapters(subjectId);
        setChapters(data || []);
      } catch {
        setError('Something went wrong – try again');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [subjectId]);

  const goBackToSubjects = () => {
    navigate(`/subjects?type=${type}`);
  };

  const handleChapterSelect = (chapter) => {
    navigate(`/questions/${subjectId}/${chapter.id}?type=${type}`);
  };

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto w-full">
        <button 
          onClick={goBackToSubjects}
          className="flex items-center text-gray-500 hover:text-[var(--color-primary)] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 capitalize tracking-tight">
          Select a Chapter - {subjectName} ({type.toUpperCase()})
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-bold py-10 bg-red-50 rounded-xl">{error}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {chapters.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
                No chapters found for this subject.
              </div>
            ) : (
              chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => handleChapterSelect(ch)}
                  className="card p-5 flex items-center justify-between hover:border-[var(--color-primary)] hover:shadow-lg transition-all text-left w-full group"
                >
                  <span className="text-lg font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                    {idx + 1}. {ch.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

