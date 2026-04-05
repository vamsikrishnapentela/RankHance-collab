import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Container from './components/Container';
import Button from './components/Button';
import PaymentModal from './components/PaymentModal';
import { Trophy, Clock, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from './api';

export default function ModelMock() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [attemptState, setAttemptState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    // If not logged in, redirect to login with return path
    if (!user) {
      navigate('/login?redirect=/model-mock');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('rankhance_token') || localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const [statusRes, attemptRes, lbRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/model-mock/status`, { headers }),
          fetch(`${API_BASE_URL}/api/model-mock/attempt`, { headers }),
          fetch(`${API_BASE_URL}/api/model-mock/leaderboard`, { headers })
        ]);

        if (statusRes.ok) setStatus(await statusRes.json());
        if (attemptRes.ok) setAttemptState(await attemptRes.json());
        if (lbRes.ok) setLeaderboard(await lbRes.json());
      } catch (err) {
        console.error("Failed to load model mock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleStartTest = () => {
    if (status?.testId) {
      navigate(`/mock/${status.testId}?type=model-mock`);
    }
  };

  const handleViewAnalysis = () => {
    if (attemptState?.hasAttempted && attemptState.attempt) {
      // Create a reconstructed test object to pass to Result
      // The Result page expects 'test', 'questions', 'answers', etc.
      const currentTest = { name: attemptState.attempt.testName };
      const currentAnswers = {};
      const currentFlags = [];

      attemptState.attempt.questions.forEach(q => {
        if (q.selectedOption !== null && q.selectedOption !== undefined) {
          currentAnswers[q.globalIdx] = q.selectedOption;
        }
        if (q.isFlagged) currentFlags.push(q.globalIdx);
      });

      navigate('/result', {
        state: {
          test: currentTest,
          questions: attemptState.attempt.questions,
          answers: currentAnswers,
          flags: currentFlags,
          score: attemptState.attempt.score,
          timeTakenSeconds: attemptState.attempt.timeTakenSeconds,
          testId: attemptState.attempt.testId,
          isModelMock: true,
        }
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="pt-24 flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!status || !status.isActive) {
    return (
      <div className="pt-24 flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)]">
        <Container className="max-w-3xl">
          <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">No Active Model Mock Test</h2>
            <p className="text-gray-500 mt-2">Currently there is no active batch for the model mock test. Please check back later!</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 flex-1 w-full bg-gray-50 min-h-[calc(100dvh-64px)]">
      <Container className="max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left space-y-2">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-2 shadow-sm">
                Batch {status.batchId} LIVE
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                EAMCET 2026 Model Mock Test
              </h1>
              <p className="text-orange-50 text-lg md:text-xl font-medium max-w-xl">
                Compete with hundreds of aspirants in this special free batch and get your true rank.
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center w-full md:w-auto min-w-[200px]">
              {attemptState?.hasAttempted ? (
                <>
                  <div className="text-orange-100 text-sm font-semibold mb-1">Your Score</div>
                  <div className="text-4xl font-black mb-4">{attemptState.attempt.score}</div>
                  <Button 
                    onClick={handleViewAnalysis}
                    className="w-full bg-white !text-orange-600 hover:bg-orange-50 font-bold border-0 shadow-md"
                    style={{ color: '#ea580c' }}
                  >
                    View Analysis
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center font-bold text-lg mb-4 text-white">Status: <span className="text-orange-200">Pending</span></div>
                  <Button 
                    onClick={handleStartTest}
                    className="w-full bg-white !text-orange-600 hover:bg-orange-50 font-bold border-0 shadow-lg text-lg py-3 animate-pulse"
                    style={{ color: '#ea580c' }}
                    rightIcon={<ArrowRight className="w-5 h-5"/>}
                  >
                    Start Test Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Overview & Leaderboard */}
        <div className="flex gap-4 border-b border-gray-200">
          <button 
            className={`pb-3 px-4 font-bold text-lg transition-colors border-b-4 ${activeTab === 'overview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`pb-3 px-4 font-bold text-lg transition-colors border-b-4 flex items-center gap-2 ${activeTab === 'leaderboard' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy className="w-5 h-5" /> Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About this Mock Test</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  This test is curated specifically for the upcoming EAMCET 2026. It mimics the exact difficulty, weightage, and pattern of the real exam. Participate in this active batch to measure where you stand relative to typical exam difficulty and other competing aspirants.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
                    <Target className="w-8 h-8 text-orange-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">160 Questions</h4>
                      <p className="text-sm text-gray-500">Maths (80), Physics (40), Chemistry (40)</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-4">
                     <Clock className="w-8 h-8 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">180 Minutes</h4>
                      <p className="text-sm text-gray-500">Time management simulation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {attemptState?.hasAttempted && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold">Your Result</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Score</span>
                      <span className="font-bold text-xl">{attemptState.attempt.score} / 160</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Time Taken</span>
                      <span className="font-bold text-lg">{formatTime(attemptState.attempt.timeTakenSeconds)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-400">Submitted</span>
                      <span className="font-semibold text-sm">
                        {new Date(attemptState.attempt.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Batch {status.batchId} Leaderboard</h3>
                <p className="text-gray-500">Top Performers</p>
              </div>
            </div>
            
            <div className="p-0">
              {leaderboard.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-lg">No attempts yet. Be the first to take the test!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-bold border-b text-center w-20">Rank</th>
                        <th className="p-4 font-bold border-b">Name</th>
                        <th className="p-4 font-bold border-b text-center">Score</th>
                        <th className="p-4 font-bold border-b text-center hidden sm:table-cell">Time Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const userEntry = leaderboard.find(e => e.name === user?.name);
                        return leaderboard.map((entry, idx) => {
                          const isCurrentUser = entry.name === user?.name;
                          return (
                            <tr key={idx} className={`border-b last:border-b-0 transition-colors ${isCurrentUser ? 'bg-orange-50 border-orange-200' : 'hover:bg-gray-50'}`}>
                              <td className="p-4 text-center">
                                {entry.rank === 1 ? <span className="text-2xl">🥇</span> : 
                                 entry.rank === 2 ? <span className="text-2xl">🥈</span> : 
                                 entry.rank === 3 ? <span className="text-2xl">🥉</span> : 
                                 <span className="font-bold text-gray-600">#{entry.rank}</span>}
                              </td>
                              <td className="p-4 font-semibold text-gray-900">
                                {entry.name} {isCurrentUser && <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">YOU</span>}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1 font-bold rounded-lg text-lg ${isCurrentUser ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                  {entry.score}
                                </span>
                              </td>
                              <td className="p-4 text-center text-gray-500 hidden sm:table-cell">
                                {formatTime(entry.timeTakenSeconds)}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                  
                  {/* Keep User Rank prominently at the bottom if attempt is made */}
                  {attemptState?.hasAttempted && !leaderboard.find(e => e.name === user?.name) && (
                    <div className="bg-orange-50 p-4 border-t-2 border-orange-200 flex justify-center text-orange-800 font-semibold text-center">
                      Your current score is {attemptState.attempt.score}. Keep practicing to reach the top ranks!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upsell to Premium Model Mocks */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-200 p-8 text-center mt-12 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-orange-200 opacity-20 transform rotate-12 scale-150">
            <Trophy size={120} />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-700 font-bold rounded-full mb-4 text-sm uppercase tracking-wide">Take the Next Step</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Want more Mock Tests?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Unlock the RankHance Premium Plan to get access to over 40+ full-length EAMCET mock tests, detailed chapter-wise analysis, formulas, and more!
            </p>
            <Button
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-xl hover:shadow-2xl font-semibold text-lg"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Unlock Premium Features
            </Button>
          </div>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      </Container>
    </div>
  );
}
