import { Link } from 'react-router-dom';
import { BookOpen, Target, CheckCircle, Smartphone } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 bg-gradient-to-b from-orange-50/40 to-white">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Crack EAMCET 2025 <br />
              <span className="text-[var(--color-primary)]">Practice Smart</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Chapter-wise questions + full quizzes for Maths, Physics, Chemistry
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center px-8 h-14 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-lg hover:bg-orange-600 transition-transform active:scale-95 shadow-xl shadow-orange-500/20 w-full sm:w-auto"
            >
              Start Now
            </Link>
            <p className="text-sm font-medium text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>Made for AP & TS students</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[var(--color-primary)]">100% free practice for now</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Everything you need to succeed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-orange-500" />}
              title="Chapter-wise Practice"
              description="Master one topic at a time with structured questions."
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8 text-orange-500" />}
              title="Important Questions"
              description="Quiz-style important questions to test your speed."
            />
            <FeatureCard 
              icon={<CheckCircle className="w-8 h-8 text-orange-500" />}
              title="Clear Explanations"
              description="Step-by-step solutions to build your concepts right."
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-orange-500" />}
              title="Mobile Friendly"
              description="Practice comfortably on any phone, anywhere."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100 bg-gray-50">
        <p>© RankHance 2025 • For EAMCET students</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform cursor-default">
      <div className="p-3 bg-orange-50 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
}
