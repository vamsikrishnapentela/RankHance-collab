import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Container from './components/Container';
import { getMockTest } from './api';
import { BookOpen, Target, CheckCircle, Smartphone, Star, Users, TrendingUp } from 'lucide-react';

export default function Landing() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  useEffect(() => {
    getMockTest(1)
      .then(data => {
        setQuestions(data.questions || []);
      })
      .catch(() => {
        console.log("Using fallback mock data for demo");
        setQuestions([
          {
            question: "If sin²θ + cos²θ = ?",
            options: ["1", "0", "2", "None"]
          },
          {
            question: "Value of tan 45°?",
            options: ["0", "1", "2", "Undefined"]
          },
          {
            question: "Derivative of x²?",
            options: ["x", "2x", "x²", "1"]
          },
          {
            question: "Unit of force?",
            options: ["Joule", "Pascal", "Newton", "Watt"]
          },
          {
            question: "Speed of light?",
            options: ["3×10^8 m/s", "1×10^6", "9.8", "None"]
          }
        ]);
      });
  }, []);

  useEffect(() => {
    const names = ["Ravi", "Anjali", "Sai", "Priya", "Arun"];
    const cities = ["Hyderabad", "Warangal", "Vijayawada", "Vizag"];

    const interval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      setPopupMsg(`${name} from ${city} just joined`);
      setPopupVisible(true);

      setTimeout(() => setPopupVisible(false), 4000);

    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: option
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentQ = questions[currentIndex] || {};

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-orange-50 text-center px-6 flex flex-col justify-center items-center flex-1">
        <Container className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Crack EAMCET 2026 <br />
              <span className="text-orange-500">Get Your Dream Rank 🚀</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Chapter-wise questions + full quizzes for Maths, Physics, Chemistry
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg flex-1 sm:flex-none"
            >
              Start Now
            </Link>
          </div>
          <p className="text-sm font-semibold bg-orange-100 text-orange-700 px-4 py-2 rounded-full inline-block">
            Made for AP & TS students • 100% free practice for now
          </p>
        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 md:py-16 bg-gray-50">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Star className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="text-base font-semibold text-gray-800 mb-1">Student Rating</div>
              <div className="text-sm text-gray-500">Trusted by EAMCET aspirants</div>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Users className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-base font-semibold text-gray-800 mb-1">Active Students</div>
              <div className="text-sm text-gray-500">Practicing daily on platform</div>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-base font-semibold text-gray-800 mb-1">Questions Solved</div>
              <div className="text-sm text-gray-500">Covering full syllabus</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need to Crack EAMCET 2026
            </h2>
            <p className="text-gray-600 text-lg">
              Stop random preparation. Follow a structured system designed for real rank improvement.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Foundation Practice</h3>
              <p className="text-sm text-gray-600">Build strong basics chapter by chapter</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Never get stuck in concepts again</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <Target className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Exam Level Questions</h3>
              <p className="text-sm text-gray-600">Solve real EAMCET questions topic-wise</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Understand actual exam patterns</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Mock Tests</h3>
              <p className="text-sm text-gray-600">Attempt full 160-question exams</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Know your real exam performance</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm opacity-50 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Weightage Analysis</h3>
              <p className="text-sm text-gray-600">Know which chapters matter most</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Study smart, save time</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm opacity-50 text-center space-y-3">
              <Target className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Study Planner</h3>
              <p className="text-sm text-gray-600">Follow topper strategies daily</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Stay consistent without stress</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm opacity-50 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">College Predictor</h3>
              <p className="text-sm text-gray-600">Predict your college based on rank</p>
              <p className="text-xs text-orange-500 font-semibold">👉 Plan your future better</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Demo Mock Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <Container className="text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Experience Real Exam Feel 🎯
            </h2>
            <p className="text-gray-600 text-lg">
              Practice with real exam pressure, timer & question flow
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Loading mock test...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* LEFT SIDE */}
              <div className="bg-white p-6 rounded-3xl shadow-lg border flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Question {currentIndex + 1} / {questions.length}</span>
                    <span className="text-orange-500 font-semibold">⏱ 02:45:12</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: questions.length
                          ? `${((currentIndex + 1) / questions.length) * 100}%`
                          : "0%"
                      }}
                    ></div>
                  </div>
                  <p className="font-semibold text-lg">
                    {currentQ.question}
                  </p>
                  <div className="space-y-2">
                    {currentQ.options?.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelect(opt)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          selectedAnswers[currentIndex] === opt
                            ? "bg-orange-100 border-orange-500"
                            : "hover:bg-orange-50"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
              {/* RIGHT SIDE */}
              <div className="bg-orange-50 p-6 rounded-3xl shadow border h-full flex flex-col justify-center text-center space-y-4">
                <h3 className="text-xl font-bold">Your Progress</h3>
                <p className="text-3xl font-bold text-orange-500">
                  {Object.keys(selectedAnswers).length} / {questions.length}
                </p>
                <p className="text-gray-600">Questions Attempted</p>
                <button className="bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
                  Start Full Mock Test →
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-orange-600 hover:scale-105 transition-all">
              Try Full Mock Test →
            </button>
          </div>
        </Container>
      </section>

      {/* Video Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container className="text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              See How RankHance Works 🚀
            </h2>
            <p className="text-gray-600 text-lg">
              Watch how students improve their rank step-by-step
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
            <iframe
              className="w-full h-[220px] md:h-[420px]"
              src="https://www.youtube.com/embed/ysz5S6PUM-U"
              title="RankHance Demo"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"></div>
          </div>

          <div className="text-sm text-gray-500">
            🎯 Real students • Real results • Real improvement
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-orange-50">
        <Container className="space-y-12">
          {/* HEADING */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Choose How You Want to Prepare 🚀
            </h2>
            <p className="text-gray-600 text-lg">
              One decision can change your rank — choose wisely
            </p>
          </div>

          {/* PRICING CARDS */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">

            {/* FREE PLAN */}
            <div className="p-6 rounded-2xl border bg-white space-y-6 flex flex-col justify-between">

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Free Plan</h3>
                <p className="text-gray-500 text-sm">
                  Limited access — good for basic practice
                </p>

                <ul className="space-y-3 text-sm">

                  <li>✔ Basic chapter questions</li>
                  <li>✔ Limited practice access</li>

                  <li className="text-gray-400">✖ No full mock tests</li>
                  <li className="text-gray-400">✖ No performance analysis</li>
                  <li className="text-gray-400">✖ No exam simulation</li>

                </ul>
              </div>

              <p className="text-sm text-gray-500">
                ⚠ You may practice, but improvement is slow without structure
              </p>

            </div>

            {/* PREMIUM PLAN */}
            <div className="p-8 rounded-2xl border-2 border-orange-500 bg-white shadow-xl space-y-6 flex flex-col justify-between relative">

              {/* BADGE */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                MOST POPULAR
              </div>

              <div className="space-y-4">

                <h3 className="text-xl font-bold text-orange-500">
                  Premium Plan
                </h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-normal line-through text-gray-500">₹299</span>
                  <span className="text-4xl font-bold text-orange-500">₹99</span>
                </div>

                <p className="text-sm text-gray-500">
                  One-time payment • Lifetime access
                </p>

                <ul className="space-y-3 text-sm">

                  <li>✔ Full-length mock tests (160Q)</li>
                  <li>✔ Real exam simulation</li>
                  <li>✔ Chapter-wise structured practice</li>
                  <li>✔ Performance tracking & analysis</li>
                  <li>✔ Covers AP & TS syllabus completely</li>

                </ul>

              </div>

              <div className="space-y-3">

                <p className="text-sm text-gray-600">
                  🎯 Improve marks faster with a proven system
                </p>

                <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-lg hover:bg-orange-600 transition">
                  Unlock Premium Now →
                </button>

              </div>

            </div>

          </div>

          {/* TRUST + URGENCY */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              🔥 1000+ students already joined
            </p>
            <p className="text-sm text-orange-500 font-semibold">
              ⏳ Limited offer ₹99 — price may increase soon
            </p>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-white">
        <Container className="space-y-12">
          {/* HEADING */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Real Students. Real Results 📈
            </h2>
            <p className="text-gray-600 text-lg">
              See how students are improving their ranks with RankHance
            </p>
          </div>

          {/* TESTIMONIAL GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* CARD */}
            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "I was confused what to study before. After using this, I improved 40+ marks in mocks."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Ravi K.</p>
                <p className="text-xs text-gray-500">EAMCET Aspirant</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "Mock tests feel exactly like real exam. It helped me manage time better."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Anjali S.</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "The analysis feature showed my weak areas clearly. I know where to focus now."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Sai Teja</p>
                <p className="text-xs text-gray-500">Dropper</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "Before this I was randomly studying. Now I follow a proper system."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Priya M.</p>
                <p className="text-xs text-gray-500">Intermediate Student</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "Worth every rupee. ₹99 is nothing compared to the value I got."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Arun Reddy</p>
                <p className="text-xs text-gray-500">EAMCET 2025</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-gray-50 space-y-4 hover:shadow-lg transition">
              <p className="text-gray-700 text-sm leading-relaxed">
                "Feels like a real exam environment. Boosted my confidence a lot."
              </p>
              <div>
                <p className="font-semibold text-gray-900">Kiran</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <Container className="grid md:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              RankHance
            </h3>
            <p className="text-sm text-gray-400 max-w-md">
              Your smart preparation partner for EAMCET 2026. Practice with real exam level questions, track your progress, and achieve your dream rank.
            </p>

            <p className="text-sm text-orange-500 font-semibold">
              🚀 Start now. Improve daily. Crack your dream rank.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col md:items-end space-y-3 text-sm">

            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/dashboard" className="hover:text-white transition">Practice</a>
            <a href="/mock-tests" className="hover:text-white transition">Mock Tests</a>
            <a href="/pricing" className="hover:text-white transition">Pricing</a>

          </div>

        </Container>
        <div className="text-center text-xs text-gray-500 mt-8 px-6">
          © 2026 RankHance. All rights reserved.
        </div>
      </footer>

      {popupVisible && (
        <div className="fixed bottom-6 left-6 bg-white border border-gray-200 shadow-lg px-4 py-3 rounded-xl text-sm text-gray-700 z-50 animate-fade-in-up">
          ✅ {popupMsg}
        </div>
      )}
    </div>
  );
}
