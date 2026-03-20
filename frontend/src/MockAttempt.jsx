import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Star, Clock } from 'lucide-react';
import Button from './components/Button';
import { getMockTest } from './api';
import MathRenderer from './components/MathRenderer';

export default function MockAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [groupedQuestions, setGroupedQuestions] = useState({ maths: [], physics: [], chemistry: [] });
  const [activeSection, setActiveSection] = useState('maths');
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(10800);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sectionQuestions = groupedQuestions[activeSection] || [];
  const currentQ = sectionQuestions[sectionIdx];
  const sectionTotals = { maths: 80, physics: 40, chemistry: 40 };

  // Load and group
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const testData = await getMockTest(id);
        if (testData && testData.questions) {
          setTest(testData);
          setTimeLeft(testData.duration * 60 || 10800);

          const groups = { maths: [], physics: [], chemistry: [] };
          testData.questions.forEach((q, globalIdx) => {
            const sub = q.subject === 'maths' ? 'maths' : q.subject === 'phy' ? 'physics' : 'chemistry';
            groups[sub].push({ ...q, globalIdx });
          });

          // Shuffle within sections
          Object.keys(groups).forEach(key => {
            groups[key] = groups[key].sort(() => Math.random() - 0.5);
          });

          setGroupedQuestions(groups);
        }
      } catch {
        setError('Failed to load test. Try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Timer
  useEffect(() => {
    let interval;
    if (timeLeft > 0 && !loading) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev <= 1 ? 0 : prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, loading]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const toggleFlag = useCallback((globalIdx) => {
    setFlags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(globalIdx)) newSet.delete(globalIdx);
      else newSet.add(globalIdx);
      return newSet;
    });
  }, []);

  const handleSelectOption = useCallback((optIdx, globalIdx) => {
    setAnswers((prev) => ({ ...prev, [globalIdx]: optIdx }));
  }, []);

  const goPreviousSection = () => setSectionIdx((prev) => Math.max(0, prev - 1));
  const goNextSection = () => setSectionIdx((prev) => Math.min(sectionQuestions.length - 1, prev + 1));

  const handleFinish = () => {
    const allQuestions = Object.values(groupedQuestions).flat();
    navigate('/result', { state: { test, questions: allQuestions, answers, flags: Array.from(flags) } });
  };

  // Stats
  const getSectionStats = (qs) => {
    const answered = qs.filter((q) => answers[q.globalIdx] !== undefined).length;
    const flagged = qs.filter((q) => flags.has(q.globalIdx)).length;
    return { answered, flagged, total: qs.length };
  };

  const mathsStats = getSectionStats(groupedQuestions.maths);
  const physicsStats = getSectionStats(groupedQuestions.physics);
  const chemistryStats = getSectionStats(groupedQuestions.chemistry);

  const globalAnswered = mathsStats.answered + physicsStats.answered + chemistryStats.answered;
  const globalTotal = mathsStats.total + physicsStats.total + chemistryStats.total;
  const globalFlagged = mathsStats.flagged + physicsStats.flagged + chemistryStats.flagged;

  if (loading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <div className="text-lg font-medium text-gray-500">Loading test...</div>
      </div>
    );
  }

  if (error || globalTotal === 0) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center text-red-500 font-bold py-20 bg-red-50 rounded-xl px-6">
            {error || 'No questions available.'}
          </div>
        </div>
      </div>
    );
  }

  const currentGlobalIdx = currentQ ? currentQ.globalIdx : 0;

  const isFlagged = flags.has(currentGlobalIdx);

  return (
      <div className="flex-1 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 lg:hidden">
          {/* Mobile tabs hidden on desktop */}
        </div>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            variant="secondary" 
            size="sm" 
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/mock-tests')}
            className="shrink-0"
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-mono text-lg font-bold text-gray-900">
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={handleFinish}>
              Finish Test
            </Button>
          </div>
        </div>

        {/* Global Progress */}
        <div className="bg-gray-50 py-3 px-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-900">{globalAnswered}/{globalTotal} Answered</span>
            <span className="font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
              {globalFlagged} Flagged
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] rounded-full transition-all" 
              style={{ width: `${(globalAnswered / globalTotal * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-20">
        {/* Subject Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border flex p-1">
          {[
            { key: 'maths', label: 'Maths', total: 80 },
            { key: 'physics', label: 'Physics', total: 40 },
            { key: 'chemistry', label: 'Chemistry', total: 40 }
          ].map(({ key, label, total }) => {
            const stats = key === 'maths' ? mathsStats : key === 'physics' ? physicsStats : chemistryStats;
            const active = activeSection === key;
            return (
              <Button
                key={key}
                variant={active ? 'default' : 'ghost'}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all capitalize ${active ? '' : 'hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveSection(key);
                  setSectionIdx(0);
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{label}</span>
                  <span>{stats.answered}/{total}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="card p-4 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-gray-900">{activeSection.toUpperCase()} ({sectionTotals[activeSection] || 0} Qs)</span>
            </div>
            <span className="text-sm font-bold bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
              Q {sectionIdx + 1} / {sectionQuestions.length}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-6 sm:p-8 relative shadow-md hover:shadow-lg transition-shadow">
          {/* Flag Button - Question level */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-75 hover:opacity-100"
            onClick={() => toggleFlag(currentGlobalIdx)}
          >
            <Star className={`w-5 h-5 transition-colors ${isFlagged ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
          </Button>

          {/* Question Text */}
          <div className="mb-8">
            <MathRenderer content={currentQ?.text || ''} />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ?.options.map((opt, optIdx) => {
              const isSelected = answers[currentGlobalIdx] === optIdx;
              const isAnswered = answers[currentGlobalIdx] !== undefined;
              let className = 'w-full p-4 rounded-xl border-2 text-left hover:border-[var(--color-primary)] hover:bg-gray-50 transition-all cursor-pointer';
              if (isAnswered) {
                if (isSelected) {
                  className += ' border-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold ring-1 ring-[var(--color-primary)]/50';
                } else {
                  className += ' border-gray-200 bg-gray-50 opacity-60';
                }
              }
              return (
                <Button
                  key={optIdx}
                  variant="ghost"
                  className={className}
                  onClick={() => handleSelectOption(optIdx, currentGlobalIdx)}
                >
                  <MathRenderer content={opt} />
                </Button>
              );
            })}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 h-14 font-bold"
            disabled={sectionIdx === 0}
            onClick={goPreviousSection}
          >
            Previous
          </Button>
          <Button
            className="flex-1 h-14 font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-sm"
            disabled={sectionIdx === sectionQuestions.length - 1}
            onClick={goNextSection}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Right Panel - Question Nav (Desktop) */}
      <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 w-16 h-fit bg-white rounded-2xl shadow-lg border p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 text-center uppercase tracking-wide">Jump</div>
        {[
          { key: 'maths', stats: mathsStats },
          { key: 'physics', stats: physicsStats },
          { key: 'chemistry', stats: chemistryStats }
        ].map(({ key, stats }) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-500">{key.slice(0,3)}</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">{stats.answered}</div>
            <div className="text-xs text-gray-400">/{stats.total}</div>
          </div>
        ))}
        <div className="text-center">
          <div className="text-xs text-gray-500">Flags</div>
          <div className="text-lg font-bold text-yellow-600">{globalFlagged}</div>
        </div>
      </div>
    </div>
  );
}

