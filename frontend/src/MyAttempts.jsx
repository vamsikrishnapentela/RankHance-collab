import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import Container from './components/Container';
import Card from './components/Card';
import Button from './components/Button';
import { API_BASE_URL } from './api';

export default function MyAttempts() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('rankhance_token') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/user/attempts`, {
          headers: { 'x-auth-token': token },
        });
        if (!res.ok) throw new Error('Failed to fetch attempts');
        const data = await res.json();
        setAttempts(data);
      } catch (err) {
        setError('Could not load your attempts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatTime = (s) => {
    if (!s && s !== 0) return '—';
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // Score colour helper
  const scoreColor = (score, total) => {
    if (!total) return 'text-gray-500';
    const pct = (score / total) * 100;
    if (pct >= 70) return 'text-green-600';
    if (pct >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Loading your attempts…</span>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center p-6 min-h-[calc(100dvh-64px)]">
        <Card className="text-center p-12 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (attempts.length === 0) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center p-6 min-h-[calc(100dvh-64px)]">
        <Card className="text-center p-12 max-w-md">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Attempts Yet</h2>
          <p className="text-gray-500 mb-6">You haven't completed any mock tests. Give one a shot!</p>
          <Button variant="primary" onClick={() => navigate('/mock-tests')}>
            Browse Mock Tests
          </Button>
        </Card>
      </div>
    );
  }


  // ── List ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full bg-gray-50 min-h-[calc(100dvh-64px)] py-10">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 font-heading">My Attempts</h1>
          <p className="text-gray-500 mt-1">{attempts.length} test{attempts.length !== 1 ? 's' : ''} completed</p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {attempts.map((a, i) => {
            const score= a.correct ?? a.score ?? 0; // Use correct answers as score, default to 0 if not present
            const maxScore  = a.totalQuestions || 0;
            const pct       = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

            return (
              <div
                key={a._id || i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Index bubble */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center font-extrabold text-[var(--color-primary)] text-lg">
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-base truncate">
                    {a.testName || a.testId}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(a.timeTakenSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {a.totalQuestions} Qs
                    </span>
                    <span>{formatDate(a.submittedAt)}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className={`text-2xl font-extrabold ${scoreColor(score, a.totalQuestions)}`}>
                      {score}/{a.totalQuestions}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Score</div>
                  </div>

                  {/* Mini progress ring */}
                  <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={pct >= 70 ? '#16a34a' : pct >= 40 ? '#eab308' : '#ef4444'}
                        strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {pct}%
                    </span>
                  </div>

                  {/* Review button */}
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate('/review', { state: { testId: a.testId } })}
                  >
                    Review
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}