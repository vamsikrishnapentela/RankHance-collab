import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight, Star, Loader } from 'lucide-react';
import Card from './components/Card';
import Button from './components/Button';
import MathRenderer from './components/MathRenderer';
import Container from './components/Container';

// ─── Single option row ────────────────────────────────────────────────────────
const Option = ({ opt, optIdx, userAnswer, correctIndex }) => {
  const isUserSelected  = userAnswer === optIdx;
  const isCorrectOption = optIdx === correctIndex;

  let borderCls = 'border-gray-200';
  let bgCls     = '';

  if (isCorrectOption)                    { borderCls = 'border-green-500'; bgCls = 'bg-green-50'; }
  if (isUserSelected && !isCorrectOption) { borderCls = 'border-red-500';   bgCls = 'bg-red-50';   }

  return (
    <div className={`p-3 rounded-lg border-2 ${borderCls} ${bgCls}`}>
      <MathRenderer content={opt} />

      {isUserSelected && !isCorrectOption && (
        <div className="text-red-600 text-xs font-semibold mt-1">❌ Your Answer</div>
      )}
      {isCorrectOption && isUserSelected && (
        <div className="text-green-700 text-xs font-semibold mt-1">✅ Your Answer (Correct)</div>
      )}
      {isCorrectOption && !isUserSelected && (
        <div className="text-green-600 text-xs font-semibold mt-1">✅ Correct Answer</div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Review = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  // testId passed through router state from Result page
  const testIdFromState = location.state?.testId;

  const [questions,   setQuestions]   = useState([]);
  const [attemptMeta, setAttemptMeta] = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');

  // ── Fetch saved attempt from backend ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!testIdFromState) {
        setFetchError('No test ID found. Please go back and try again.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('rankhance_token') || localStorage.getItem('token');
        const res = await fetch(`/api/mocktest/${testIdFromState}/attempt`, {
          headers: { 'x-auth-token': token },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to load attempt');
        }

        const data = await res.json();

        setAttemptMeta({
          testName:         data.testName,
          score:            data.score,
          totalQuestions:   data.totalQuestions,
          timeTakenSeconds: data.timeTakenSeconds,
          submittedAt:      data.submittedAt,
        });

        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
        setFetchError(err.message || 'Failed to load review data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [testIdFromState]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredQuestions = questions.filter(q => {
    const sel     = q.selectedOption;   // null = unattempted
    const correct = sel === q.correctIndex;
    if (filter === 'correct')     return sel !== null && correct;
    if (filter === 'wrong')       return sel !== null && !correct;
    if (filter === 'unattempted') return sel === null;
    if (filter === 'flagged')     return q.isFlagged;
    return true;
  });

  const currentQ = filteredQuestions[currentIdx];

  const goPrev = () => setCurrentIdx(p => Math.max(0, p - 1));
  const goNext = () => setCurrentIdx(p => Math.min(filteredQuestions.length - 1, p + 1));

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s) => {
    if (!s && s !== 0) return '—';
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex items-center gap-3 text-gray-500 text-lg font-medium">
          <Loader className="w-5 h-5 animate-spin" />
          Loading your review…
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <Card className="text-center p-12 max-w-md">
          <p className="text-red-600 font-semibold mb-6">{fetchError}</p>
          <Button onClick={() => navigate('/mock-tests')} variant="primary">
            Back to Mock Tests
          </Button>
        </Card>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <Card className="text-center p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Review Data</h2>
          <Button onClick={() => navigate('/mock-tests')} variant="primary">
            Back to Mock Tests
          </Button>
        </Card>
      </div>
    );
  }

  // ── Filter counts (for badges) ────────────────────────────────────────────
  const counts = {
    all:         questions.length,
    correct:     questions.filter(q => q.selectedOption !== null && q.selectedOption === q.correctIndex).length,
    wrong:       questions.filter(q => q.selectedOption !== null && q.selectedOption !== q.correctIndex).length,
    unattempted: questions.filter(q => q.selectedOption === null).length,
    flagged:     questions.filter(q => q.isFlagged).length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full bg-gray-50 min-h-[calc(100vh-64px)] p-6">
      <Container>

        {/* Back button */}
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/result', { state: location.state })}
          className="mb-6"
        >
          Back to Results
        </Button>

        {/* ── Attempt summary strip ──────────────────────────────────────────── */}
        {attemptMeta && (
          <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex flex-wrap gap-6 items-center">
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Test</div>
              <div className="font-bold text-gray-900">{attemptMeta.testName || 'Mock Test'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Score</div>
              <div className="font-bold text-[var(--color-primary)] text-2xl">{attemptMeta.score}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Correct</div>
              <div className="font-bold text-green-600 text-xl">{counts.correct}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Wrong</div>
              <div className="font-bold text-red-500 text-xl">{counts.wrong}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Unattempted</div>
              <div className="font-bold text-gray-500 text-xl">{counts.unattempted}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Time Taken</div>
              <div className="font-bold text-gray-900">{formatTime(attemptMeta.timeTakenSeconds)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Submitted</div>
              <div className="font-bold text-gray-900">
                {attemptMeta.submittedAt
                  ? new Date(attemptMeta.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : '—'}
              </div>
            </div>
          </div>
        )}

        {/* ── Filter buttons ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all',         label: 'All' },
            { key: 'correct',     label: '✅ Correct' },
            { key: 'wrong',       label: '❌ Wrong' },
            { key: 'unattempted', label: '⚠️ Unattempted' },
            { key: 'flagged',     label: '⭐ Flagged' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => { setFilter(key); setCurrentIdx(0); }}
            >
              {label}&nbsp;<span className="opacity-60">({counts[key]})</span>
            </Button>
          ))}
        </div>

        {/* Question counter */}
        <div className="text-center mb-6">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide bg-gray-200 px-4 py-2 rounded-full">
            Q {currentIdx + 1} of {filteredQuestions.length} · {filter}
          </span>
        </div>

        {/* ── No results for current filter ──────────────────────────────────── */}
        {filteredQuestions.length === 0 ? (
          <Card className="text-center p-12">
            <p className="text-gray-500 font-medium">No questions match this filter.</p>
          </Card>
        ) : (
          <>
            {/* ── Question card ──────────────────────────────────────────────── */}
            <Card className="mb-8">

              {/* Subject badge + flag indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
                  {currentQ?.subject}
                </span>
                {currentQ?.isFlagged && (
                  <span className="flex items-center gap-1 text-yellow-600 text-xs font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400" /> Flagged
                  </span>
                )}
              </div>

              {/* Question text */}
              <div className="mb-6">
                <MathRenderer content={currentQ?.text} />
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ?.options?.map((opt, optIdx) => (
                  <Option
                    key={optIdx}
                    opt={opt}
                    optIdx={optIdx}
                    userAnswer={currentQ.selectedOption}
                    correctIndex={currentQ.correctIndex}
                  />
                ))}
              </div>

              {/* Unattempted notice */}
              {currentQ?.selectedOption === null && (
                <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-300 rounded-xl text-yellow-700 text-sm font-semibold">
                  ⚠️ You did not attempt this question.
                </div>
              )}

              {/* Explanation */}
              {currentQ?.explanation && (
                <div className="p-6 bg-gray-100/80 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Explanation{' '}
                    {currentQ.selectedOption !== null
                      ? currentQ.selectedOption === currentQ.correctIndex
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <XCircle className="w-5 h-5 text-red-600" />
                      : null}
                  </h4>
                  <div className="prose max-w-none">
                    <MathRenderer content={currentQ.explanation} />
                  </div>
                </div>
              )}
            </Card>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="secondary"
                disabled={currentIdx === 0}
                onClick={goPrev}
                leftIcon={<ChevronLeft className="w-5 h-5" />}
              >
                Previous
              </Button>
              <div className="text-base font-bold text-gray-700">
                {currentIdx + 1} / {filteredQuestions.length}
              </div>
              <Button
                variant="primary"
                disabled={currentIdx === filteredQuestions.length - 1}
                onClick={goNext}
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* ── Bottom action buttons ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/result', { state: location.state })}
            className="flex-1"
          >
            Back to Results
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
        </div>

      </Container>
    </div>
  );
};

export default Review;