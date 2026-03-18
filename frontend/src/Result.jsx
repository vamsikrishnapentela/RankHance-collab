import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import Card from './components/Card';
import Button from './components/Button';
import MathRenderer from './components/MathRenderer';
import Container from './components/Container';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { test, questions, answers, flags } = location.state || {}; // eslint-disable-line no-unused-vars
  
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    unattempted: 0,
    score: 0,
    accuracy: 0,
    attempted: 0
  });
  
  const [subjectStats, setSubjectStats] = useState({});
  const [chapterStats, setChapterStats] = useState({});

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const total = questions.length;
    let correct = 0, wrong = 0, unattempted = 0;
    const subjStats = { maths: { correct: 0, wrong: 0, total: 0 }, physics: { correct: 0, wrong: 0, total: 0 }, chemistry: { correct: 0, wrong: 0, total: 0 } };
    const chapStats = {};

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns === q.correctIndex;

      if (userAns !== undefined) {
        if (isCorrect) correct++;
        else wrong++;
      } else {
        unattempted++;
      }

      // Subject (map from q.subject or dir)
      const subject = q.subject === 'maths' ? 'maths' : q.subject === 'phy' ? 'physics' : 'chemistry';
      subjStats[subject].total++;
      if (userAns !== undefined) {
        if (isCorrect) subjStats[subject].correct++;
        else subjStats[subject].wrong++;
      }

      // Chapter (use q.name or id)
      const chapter = q.name || q.id || 'unknown';
      if (!chapStats[chapter]) chapStats[chapter] = { correct: 0, wrong: 0, total: 0, accuracy: 0, level: '' };
      chapStats[chapter].total++;
      if (userAns !== undefined) {
        if (isCorrect) chapStats[chapter].correct++;
        else chapStats[chapter].wrong++;
      }
    });

    Object.keys(chapStats).forEach(ch => {
      const acc = chapStats[ch].total > 0 ? (chapStats[ch].correct / chapStats[ch].total * 100) : 0;
      chapStats[ch].accuracy = Math.round(acc);
      if (acc >= 70) chapStats[ch].level = 'strong';
      else if (acc >= 40) chapStats[ch].level = 'medium';
      else chapStats[ch].level = 'weak';
    });

    Object.keys(subjStats).forEach(s => {
      const acc = subjStats[s].total > 0 ? (subjStats[s].correct / subjStats[s].total * 100) : 0;
      subjStats[s].accuracy = Math.round(acc);
    });

    const attempted = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const score = Math.round((correct / total) * 100);

    setStats({ total, correct, wrong, unattempted, score, accuracy, attempted });
    setSubjectStats(subjStats);
    setChapterStats(chapStats);
  }, [questions, answers]);

  if (!questions) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <Card className="text-center p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results</h2>
          <p className="text-gray-500 mb-6">No test data found.</p>
          <Button onClick={() => navigate('/mock-tests')} variant="primary">
            Back to Mock Tests
          </Button>
        </Card>
      </div>
    );
  }

  const weakChapters = Object.entries(chapterStats).filter(([ , data]) => data.level === 'weak');
  const mediumChapters = Object.entries(chapterStats).filter(([ , data]) => data.level === 'medium');
  const strongChapters = Object.entries(chapterStats).filter(([ , data]) => data.level === 'strong');

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-[calc(100vh-64px)] p-6">
      <Container>
        <Button 
          variant="secondary" 
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back
        </Button>

        {/* Summary Card */}
        <Card className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {stats.score}%
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500">{stats.unattempted}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Unattempted</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Total</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            Accuracy: {stats.accuracy}%
          </div>
        </Card>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(subjectStats).map(([subject, data]) => (
            <Card key={subject}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">{subject}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-green-600 font-semibold">{data.correct}</span>
                  <span>Correct</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600 font-semibold">{data.wrong}</span>
                  <span>Wrong</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                {data.accuracy}%
              </div>
            </Card>
          ))}
        </div>

        {/* Chapter Analysis */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapter Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakChapters.map(([ch, data]) => (
              <div key={ch} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-800">Weak</span>
                </div>
                <h4 className="font-bold text-gray-900">{ch}</h4>
                <div className="text-2xl font-bold text-red-600">{data.accuracy}%</div>
              </div>
            ))}
            {mediumChapters.map(([ch, data]) => (
              <div key={ch} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-yellow-800">Medium</span>
                </div>
                <h4 className="font-bold text-gray-900">{ch}</h4>
                <div className="text-2xl font-bold text-yellow-600">{data.accuracy}%</div>
              </div>
            ))}
            {strongChapters.map(([ch, data]) => (
              <div key={ch} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-800">Strong</span>
                </div>
                <h4 className="font-bold text-gray-900">{ch}</h4>
                <div className="text-2xl font-bold text-green-600">{data.accuracy}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/review', { state: { questions, answers, flags } })}
            className="flex-1"
          >
            Review Questions
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Result;

