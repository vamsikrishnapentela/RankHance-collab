import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './components/Card';
import Button from './components/Button';
import MathRenderer from './components/MathRenderer';
import Container from './components/Container';

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions: origQuestions, answers, flags } = location.state || {};
  const questions = origQuestions;

  const [filter, setFilter] = useState('all'); // all, correct, wrong, unattempted
  const [currentIdx, setCurrentIdx] = useState(0);

  const filteredQuestions = questions?.filter((q, idx) => {
    const userAns = answers[idx];
    const isCorrect = userAns === q.correctIndex;
    if (filter === 'correct') return userAns !== undefined && isCorrect;
    if (filter === 'wrong') return userAns !== undefined && !isCorrect;
    if (filter === 'unattempted') return userAns === undefined;
    return true; // all
  }) || [];

  const currentQ = filteredQuestions[currentIdx];
  const qGlobalIdx = currentQ ? questions.indexOf(currentQ) : -1;
  const userAns = qGlobalIdx >= 0 ? answers[qGlobalIdx] : undefined;
  const isCorrect = userAns === currentQ?.correctIndex;
  const isFlagged = flags && flags.includes(qGlobalIdx); // eslint-disable-line no-unused-vars

  if (!questions || questions.length === 0) {
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

  const goPrev = () => setCurrentIdx(prev => Math.max(0, prev - 1));
  const goNext = () => setCurrentIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1));

  const Option = ({ opt, optIdx, isUser, isRight }) => {
    const userAns = isUser;
    const correctAns = isRight;
    return (
      <div className={`p-3 rounded-lg border
        ${correctAns ? "bg-green-100 border-green-500" : ""}
        ${userAns && !correctAns ? "bg-red-100 border-red-500" : ""}
        ${userAns && correctAns ? "bg-green-100 border-green-500" : ""}
      `}>
        <span className="font-bold w-6 text-sm">({String.fromCharCode(65 + optIdx)})</span>
        <MathRenderer content={opt} />

        {/* LABELS */}
        {userAns && !correctAns && (
          <div className="text-red-600 text-xs mt-1">
            ❌ Your Answer
          </div>
        )}

        {correctAns && (
          <div className="text-green-600 text-xs mt-1">
            ✅ Correct Answer
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-[calc(100vh-64px)] p-6">
      <Container>
        <Button 
          variant="secondary" 
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/result')}
          className="mb-6"
        >
          Back to Results
        </Button>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'correct', 'wrong', 'unattempted'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setFilter(f);
                setCurrentIdx(0);
              }}
              className="capitalize"
            >
              {f.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Question Counter */}
        <div className="text-center mb-6">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide bg-gray-200 px-4 py-2 rounded-full">
            Q {currentIdx + 1} of {filteredQuestions.length} ({filter})
          </span>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <div className="mb-6">
            <MathRenderer content={currentQ?.text} />
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ?.options.map((opt, optIdx) => (
              <Option 
                key={optIdx}
                opt={opt}
                optIdx={optIdx}
                isUser={userAns === optIdx}
                isRight={optIdx === currentQ.correctIndex}
              />
            ))}
          </div>

          {/* Optional Summary */}
          {userAns !== undefined && userAns !== currentQ?.correctIndex && (
            <div className="mt-2 text-sm text-gray-600">
              You selected option {userAns + 1}, correct answer is option {currentQ.correctIndex + 1}
            </div>
          )}

          {/* Explanation */}
          {currentQ?.explanation && (
            <div className="p-6 bg-gray-100/80 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                Explanation {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              </h4>
              <div className="prose max-w-none">
                <MathRenderer content={currentQ.explanation} />
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="secondary"
            disabled={currentIdx === 0}
            onClick={goPrev}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            Previous
          </Button>
          <div className="text-lg font-bold text-gray-900">
            Progress: {currentIdx + 1} / {filteredQuestions.length}
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

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            variant="secondary"
            size="lg"
            onClick={() => navigate('/result')}
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

