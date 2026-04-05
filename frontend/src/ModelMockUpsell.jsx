import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import Button from './components/Button';
import Container from './components/Container';
import PaymentModal from './components/PaymentModal';

export default function ModelMockUpsell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100dvh-64px)]">
      <Container className="max-w-2xl w-full">
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/result', { state: location.state })}
          className="mb-6"
        >
          Back to Results
        </Button>

        <div className="bg-white rounded-3xl shadow-xl border border-orange-200 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-orange-200 opacity-20 transform rotate-12 scale-150 pointer-events-none">
            <Star size={150} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-orange-500 fill-orange-500" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Review Restricted
            </h2>
            
            <div className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
              <p className="mb-4">
                We do not provide detailed question-by-question review for this free Model Mock Test.
              </p>
              <p>
                <strong>Take our Premium Plan</strong> to access <strong>40+ Advanced Mock Tests</strong> where you can find clear, detailed reviews for each question alongside many more exclusive features!
              </p>
            </div>

            <div className="pt-4 flex flex-col space-y-4 max-w-sm mx-auto">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => setIsPaymentModalOpen(true)}
                className="shadow-xl shadow-orange-500/20 hover:scale-[1.03] transition-transform text-white bg-gradient-to-r from-orange-500 to-orange-600 border-0 py-4 font-bold text-lg"
              >
                Buy Premium
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Container>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
