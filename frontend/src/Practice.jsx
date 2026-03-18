import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getChapters, getQuestions, getQuiz } from './api';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'chapter'; // chapter or quiz

  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Track selected option per question: { [questionId_or_Index]: number }
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Subject Selection View
  if (!subject) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight text-center">
          Choose a Subject
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { id: 'maths', name: 'Mathematics', color: 'bg-blue-500' },
            { id: 'phy', name: 'Physics', color: 'bg-purple-500' },
            { id: 'che', name: 'Chemistry', color: 'bg-green-500' }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => {
                setSubject(sub.id);
                fetchChapters(sub.id);
              }}
              className={`card p-8 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-transform shadow-lg ${sub.color} text-white border-0`}
            >
              <h3 className="text-2xl font-bold tracking-wide">{sub.name}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Fetch Chapters
  const fetchChapters = async (subId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getChapters(subId);
      setChapters(data || []);
    } catch {
      setError('Something went wrong – try again');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Questions
  const handleChapterSelect = async (chapter) => {
    setSelectedChapter(chapter);
    setLoading(true);
    setError('');
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
    
    try {
      let data = [];
      if (type === 'quiz') {
        data = await getQuiz(chapter.id);
      } else {
        data = await getQuestions(chapter.id);
      }
      setQuestions(data || []);
    } catch {
      setError('Something went wrong – try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex) => {
    if (answers[currentIdx] !== undefined) return; // already answered
    setAnswers(prev => ({ ...prev, [currentIdx]: optIndex }));
  };

  const goBackToChapters = () => {
    setSelectedChapter(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
  };

  const goBackToSubjects = () => {
    setSubject(null);
    setChapters([]);
  };

  // 2. Chapter List View
  if (!selectedChapter) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto w-full">
          <button 
            onClick={goBackToSubjects}
            className="flex items-center text-gray-500 hover:text-[var(--color-primary)] font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Subjects
          </button>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 capitalize tracking-tight">
            Select a Chapter
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
                <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-xl border border-gray-200">No chapters found.</div>
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

  // 3. Question View
  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto w-full relative">
        <button 
          onClick={goBackToChapters}
          className="flex items-center text-gray-500 hover:text-[var(--color-primary)] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Chapters
        </button>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-bold py-10 bg-red-50 rounded-xl">{error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-200">
            No questions available for this chapter yet.
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-200 px-3 py-1 rounded-full">
                Q {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-sm font-bold text-[var(--color-primary)] bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider truncate max-w-[200px] sm:max-w-xs">
                {selectedChapter.name}
              </span>
            </div>

            <div className="card p-6 sm:p-8 mb-6 relative">
  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
    <MathRenderer content={questions[currentIdx].text} />
  </div>
  <div className="flex flex-col gap-4">
    {questions[currentIdx].options.map((opt, optIdx) => {
      const isAnswered = answers[currentIdx] !== undefined;
      const isSelected = answers[currentIdx] === optIdx;
      const isCorrectAnswer = questions[currentIdx].correctIndex === optIdx;
      
      let btnClass = "border-gray-200 hover:border-gray-300 bg-white text-gray-800";
      let Icon = null;
      
      if (isAnswered) {
        if (isCorrectAnswer) {
          btnClass = "border-green-500 bg-green-50 text-green-900 font-semibold ring-1 ring-green-500 shadow-sm";
          Icon = <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (isSelected) {
          btnClass = "border-red-500 bg-red-50 text-red-900 font-semibold ring-1 ring-red-500 shadow-sm";
          Icon = <XCircle className="w-5 h-5 text-red-600" />;
        } else {
          btnClass = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
        }
      } else {
        btnClass += " hover:bg-gray-50 cursor-pointer active:scale-[0.99]";
      }
      
      return (
        <button
          key={optIdx}
          disabled={isAnswered}
          onClick={() => handleSelectOption(optIdx)}
          className={`min-h-[56px] w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between text-base sm:text-lg ${btnClass}`}
        >
          <MathRenderer content={opt} />
          {Icon && <span>{Icon}</span>}
        </button>
      );
    })}
  </div>

              {answers[currentIdx] !== undefined && (
                <div className="mt-8 p-5 bg-gray-100/80 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-[var(--color-primary)]">Explanation</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    <MathRenderer content={questions[currentIdx].explanation} />
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between space-x-4 mb-20 md:mb-10">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="flex flex-1 justify-center items-center h-14 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>
              
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="flex flex-1 justify-center items-center h-14 rounded-2xl bg-[var(--color-primary)] text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={goBackToChapters}
                  className="flex flex-1 justify-center items-center h-14 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                >
                  Finish
                  <CheckCircle className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
