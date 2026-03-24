import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, AlertCircle, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFormulas } from './api';
import MathRenderer from './components/MathRenderer';
import PaymentModal from './components/PaymentModal';

export default function Formulas() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [subject, setSubject] = useState('maths');
  const [year, setYear] = useState('1');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    fetchFormulas();
  }, [subject, year]);

  const fetchFormulas = async () => {
    setLoading(true);
    setError('');
    // Clear previously expanded chapter
    setExpandedChapter(null);
    try {
      const data = await getFormulas(subject, year);
      setChapters(data);
    } catch (err) {
      console.error('Error fetching formulas:', err);
      setError('Formulas not available for this selection yet.');
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-gray-50 p-4 md:p-8 min-h-[calc(100dvh-64px)] font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-2">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl shrink-0">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Formulas Revision</h1>
            <p className="text-gray-500 text-sm md:text-base">Master all key formulas for EAPCET</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Subject Selector */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['maths', 'physics', 'chemistry'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`flex-1 py-2 text-sm md:text-base font-bold rounded-lg capitalize transition-colors ${
                      subject === s ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {['1', '2'].map(y => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`flex-1 py-2 text-sm md:text-base font-bold rounded-lg transition-colors ${
                      year === y ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {y === '1' ? '1st Year' : '2nd Year'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 pb-12">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-orange-50 border border-orange-100 text-orange-600 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-semibold text-lg">{error}</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm text-center text-gray-500 flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-semibold text-lg">No formulas found.</p>
              <p className="text-sm mt-1">Select a different subject or year.</p>
            </div>
          ) : (
            chapters.map((chapter) => (
              <div key={chapter.id || chapter.chapter} className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => {
                    if (chapter.locked) {
                      setIsPaymentModalOpen(true);
                      return;
                    }
                    setExpandedChapter(expandedChapter === (chapter.id || chapter.chapter) ? null : (chapter.id || chapter.chapter));
                  }}
                  className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 md:text-lg">{chapter.chapter}</span>
                    {chapter.locked && <Lock className="w-5 h-5 text-gray-400 shrink-0" />}
                  </div>
                  {expandedChapter === (chapter.id || chapter.chapter) ? (
                    <ChevronDown className="w-5 h-5 text-orange-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                
                {expandedChapter === (chapter.id || chapter.chapter) && (
                  <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50/50 space-y-6">
                    {chapter.topics && chapter.topics.map((topic, tIdx) => (
                      <div key={topic.id || tIdx} className="space-y-3">
                        {topic.label && <h3 className="font-bold text-gray-900 border-b pb-2">{topic.label}</h3>}
                        
                        <div className="space-y-3">
                          {topic.type === 'list' && topic.items && topic.items.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                              {item.sub && <span className="font-bold text-gray-700 text-sm md:text-base text-orange-600 border-b border-gray-50 pb-1">{item.sub}</span>}
                              {item.text && <p className="text-gray-600 text-sm md:text-base leading-relaxed">{item.text}</p>}
                              {item.latex && (
                                <div className="overflow-x-auto py-2 katex-wrapper max-w-full">
                                  <MathRenderer content={`\\[${item.latex}\\]`} />
                                </div>
                              )}
                            </div>
                          ))}

                          {topic.type === 'formula' && topic.latex && (
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-x-auto katex-wrapper max-w-full">
                              <MathRenderer content={`\\[${topic.latex}\\]`} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
