import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import Button from './components/Button';
import { getMockTest } from './api';
import MathRenderer from './components/MathRenderer';
import { API_BASE_URL } from './api';

export default function MockAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const persistenceKey = `mockattempt-${id}`;
  const [test, setTest] = useState(null);
  const [groupedQuestions, setGroupedQuestions] = useState({ maths: [], physics: [], chemistry: [] });
  const [activeSection, setActiveSection] = useState('maths');
  const [isRestored, setIsRestored] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(10800);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shouldRestoreOnLoad, setShouldRestoreOnLoad] = useState(true);

  // Use refs so the timer callback always has fresh values without re-registering
  const answersRef = useRef(answers);
  const flagsRef = useRef(flags);
  const groupedQuestionsRef = useRef(groupedQuestions);
  const testRef = useRef(test);
  const startTimeRef = useRef(Date.now());
  const submittingRef = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { flagsRef.current = flags; }, [flags]);
  useEffect(() => { groupedQuestionsRef.current = groupedQuestions; }, [groupedQuestions]);
  useEffect(() => { testRef.current = test; }, [test]);

  // Restore draft attempt from localStorage when page reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(persistenceKey);
      if (!saved) {
        setShouldRestoreOnLoad(false);
        return;
      }
      const parsed = JSON.parse(saved);
      if (!parsed) {
        setShouldRestoreOnLoad(false);
        return;
      }

      if (parsed.answers) setAnswers(parsed.answers);
      if (parsed.flags) setFlags(new Set(parsed.flags));
      if (parsed.activeSection) setActiveSection(parsed.activeSection);
      if (parsed.sectionIdx || parsed.sectionIdx === 0) setSectionIdx(parsed.sectionIdx);
      if (parsed.timeLeft || parsed.timeLeft === 0) setTimeLeft(parsed.timeLeft);
      setIsRestored(true);

      if (parsed.scrollTop || parsed.scrollTop === 0) {
        setTimeout(() => window.scrollTo(0, parsed.scrollTop), 100);
      }

      setShouldRestoreOnLoad(false);
    } catch (err) {
      console.warn('Failed to restore mock attempt from localStorage', err);
      setShouldRestoreOnLoad(false);
    }
  }, [persistenceKey]);

  const sectionQuestions = groupedQuestions[activeSection] || [];
  const currentQ = sectionQuestions[sectionIdx];
  const sectionTotals = { maths: 80, physics: 40, chemistry: 40 };

  // Load and group questions
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const testData = await getMockTest(id);
        if (testData && testData.questions) {
          setTest(testData);
          setTimeLeft(prev => (prev !== 10800 ? prev : (testData.duration * 60 || 10800)));

          const groups = { maths: [], physics: [], chemistry: [] };
          testData.questions.forEach((q, globalIdx) => {
            const sub = q.subject === 'maths' ? 'maths' : q.subject === 'phy' ? 'physics' : 'chemistry';
            groups[sub].push({ ...q, globalIdx });
          });

          // Keep original order as delivered by backend (no shuffle)
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

  // Persist current progress to localStorage (auto-save)
  useEffect(() => {
    if (!test) return;

    const payload = {
      answers,
      flags: Array.from(flags),
      activeSection,
      sectionIdx,
      timeLeft,
      scrollTop: window.scrollY || 0,
      testId: id,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(persistenceKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save mock attempt progress', err);
    }
  }, [test, answers, flags, activeSection, sectionIdx, timeLeft, persistenceKey, id]);

  // ── Submit handler (called on button click OR timer expiry) ────────────────
  const handleFinish = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    const currentAnswers = answersRef.current;
    const currentFlags = flagsRef.current;
    const currentGroups = groupedQuestionsRef.current;
    const currentTest = testRef.current;
    const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const allQuestions = Object.values(currentGroups).flat();

    // Slim payload for storage
    const questionsForStorage = allQuestions.map(q => ({
      questionId: q.id,
      globalIdx: q.globalIdx,
      subject: q.subject,
    }));

    let serverScore = null;

    try {
      const token = localStorage.getItem('rankhance_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/mocktest/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          testId: id,
          testName: currentTest?.name,
          questions: questionsForStorage,
          answers: currentAnswers,
          flags: Array.from(currentFlags),
          timeTakenSeconds,
        }),
      });
      const data = await res.json();
      serverScore = data.score;
    } catch (err) {
      console.error('Submit error (navigating anyway):', err);
    } finally {
      try {
        localStorage.removeItem(persistenceKey);
      } catch (err) {
        console.warn('Failed to clear saved attempt from localStorage', err);
      }
    }

    navigate('/result', {
      state: {
        test: currentTest,
        questions: allQuestions,
        answers: currentAnswers,
        flags: Array.from(currentFlags),
        score: serverScore,
        timeTakenSeconds,
        testId: id,
      },
    });
  }, [id, navigate]);

  // Timer
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, handleFinish]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const toggleFlag = useCallback((globalIdx) => {
    setFlags(prev => {
      const next = new Set(prev);
      if (next.has(globalIdx)) next.delete(globalIdx);
      else next.add(globalIdx);
      return next;
    });
  }, []);

  const handleSelectOption = useCallback((optIdx, globalIdx) => {
    setAnswers(prev => ({ ...prev, [globalIdx]: optIdx }));
  }, []);

  const goPreviousSection = () => setSectionIdx(prev => Math.max(0, prev - 1));
  const goNextSection = () => setSectionIdx(prev => Math.min(sectionQuestions.length - 1, prev + 1));

  // Stats
  const getSectionStats = (qs) => ({
    answered: qs.filter(q => answers[q.globalIdx] !== undefined).length,
    flagged: qs.filter(q => flags.has(q.globalIdx)).length,
    total: qs.length,
  });

  const mathsStats = getSectionStats(groupedQuestions.maths);
  const physicsStats = getSectionStats(groupedQuestions.physics);
  const chemistryStats = getSectionStats(groupedQuestions.chemistry);

  const globalAnswered = mathsStats.answered + physicsStats.answered + chemistryStats.answered;
  const globalTotal = mathsStats.total + physicsStats.total + chemistryStats.total;
  const globalFlagged = mathsStats.flagged + physicsStats.flagged + chemistryStats.flagged;

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <div className="text-lg font-medium text-gray-500">Loading test...</div>
      </div>
    );
  }

  if (error || (globalTotal === 0 && !isRestored)) {
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

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-28 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {isRestored && (
            <div className="w-full sm:w-auto text-sm text-white bg-green-600 px-3 py-1 rounded-lg font-semibold">
              Restored your in-progress attempt ✅
            </div>
          )}
          <div className="flex items-center justify-between w-full sm:w-auto">
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
              <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Finish Test'}
            </Button>
          </div>
        </div>
      </div>  

        {/* Global Progress Bar */}
        <div className="bg-gray-50 py-3 px-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-bold text-gray-900">{globalAnswered}/{globalTotal} Answered</span>
            <span className="font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
              {globalFlagged} Flagged
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${(globalAnswered / globalTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-20">

        {/* Subject Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border flex p-1">
          {[
            { key: 'maths',     label: 'Maths',     stats: mathsStats,     total: sectionTotals.maths },
            { key: 'physics',   label: 'Physics',   stats: physicsStats,   total: sectionTotals.physics },
            { key: 'chemistry', label: 'Chemistry', stats: chemistryStats, total: sectionTotals.chemistry },
          ].map(({ key, label, stats, total }) => {
            const active = activeSection === key;
            return (
              <Button
                key={key}
                variant={active ? 'default' : 'ghost'}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all capitalize ${active ? '' : 'hover:bg-gray-50'}`}
                onClick={() => { setActiveSection(key); setSectionIdx(0); }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{label}</span>
                  <span className="text-xs">{stats.answered}/{total}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="card p-4 sm:p-6 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-gray-900">
              {activeSection.toUpperCase()} ({sectionTotals[activeSection]} Qs)
            </span>
            <span className="text-sm font-bold bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
              Q {sectionIdx + 1} / {sectionQuestions.length}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-6 sm:p-8 relative shadow-md hover:shadow-lg transition-shadow">
          {/* Flag Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors opacity-75 hover:opacity-100"
            onClick={() => toggleFlag(currentGlobalIdx)}
          >
            <Star className={`w-5 h-5 transition-colors ${isFlagged ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
          </Button>

          {/* Question Text */}
          <div className="mb-8 pr-10">
            <MathRenderer content={currentQ?.text || ''} />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ?.options.map((opt, optIdx) => {
              const isSelected = answers[currentGlobalIdx] === optIdx;
              const isAnswered = answers[currentGlobalIdx] !== undefined;
              let cls = 'w-full p-4 rounded-xl border-2 text-left hover:border-[var(--color-primary)] hover:bg-gray-50 transition-all cursor-pointer';
              if (isAnswered) {
                if (isSelected) cls += ' border-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold ring-1 ring-[var(--color-primary)]/50';
                else cls += ' border-gray-200 bg-gray-50 opacity-60';
              }
              return (
                <Button
                  key={optIdx}
                  variant="ghost"
                  className={cls}
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

      {/* ── Right Panel – Desktop quick stats ────────────────────────────────── */}
      <div className="hidden lg:block fixed right-6 top-68 z-50 w-16 h-fit bg-white rounded-2xl shadow-lg border p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 text-center uppercase tracking-wide">Jump</div>
        {[
          { key: 'maths',     stats: mathsStats },
          { key: 'physics',   stats: physicsStats },
          { key: 'chemistry', stats: chemistryStats },
        ].map(({ key, stats }) => (
          <div key={key} className="text-center cursor-pointer" onClick={() => { setActiveSection(key); setSectionIdx(0); }}>
            <div className="text-xs text-gray-500">{key.slice(0, 3)}</div>
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