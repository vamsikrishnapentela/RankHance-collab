import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Container from './components/Container';
import AnnouncementPopup from './components/AnnouncementPopup';
import { getMockTest } from './api';
import { BookOpen, Target, CheckCircle, Smartphone, Star, Users, TrendingUp, PieChart, Video, Building } from 'lucide-react';

export default function Landing() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUnlockPremium = () => {
    const token = localStorage.getItem("rankhance_token");
    localStorage.setItem("showPayment", "true");
    if (!token) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };

  // Mini quiz states
  const [timeLeft, setTimeLeft] = useState(120); // 2 mins
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);


  useEffect(() => {
    // Using hardcoded demo questions to ensure a quick mini-quiz on the landing page without 404 errors.
    setQuestions([
      {
        question: "If sin²θ + cos²θ = ?",
        options: ["1", "0", "2", "None"],
        answer: "1"
      },
      {
        question: "Value of tan 45°?",
        options: ["0", "1", "2", "Undefined"],
        answer: "1"
      },
      {
        question: "Derivative of x²?",
        options: ["x", "2x", "x²", "1"],
        answer: "2x"
      },
      {
        question: "Unit of force?",
        options: ["Joule", "Pascal", "Newton", "Watt"],
        answer: "Newton"
      },
      {
        question: "Speed of light?",
        options: ["3×10^8 m/s", "1×10^6", "9.8", "None"],
        answer: "3×10^8 m/s"
      }
    ]);
  }, []);

  useEffect(() => {
    const names = [
      "Ravi", "Anjali", "Sai", "Priya", "Arun", "Karthik", "Sneha", "Pavan", "Divya", "Rohit",
      "Keerthi", "Sandeep", "Manoj", "Bhavya", "Vamsi", "Harika", "Lokesh", "Nikhil", "Prasanna", "Tejaswini",
      "Chaitanya", "Swathi", "Ajay", "Madhavi", "Kiran", "Sravani", "Rakesh", "Deepika", "Arjun", "Lavanya",
      "Dinesh", "Meghana", "Yashwanth", "Soujanya", "Harsha", "Navya", "Abhishek", "Sowmya", "Vinay", "Bhargavi",
      "Naresh", "Keerthana", "Ravi Teja", "Aishwarya", "Sunil", "Pooja", "Gopi", "Sindhu", "Tarun", "Akshara",
      "Praveen", "Nandini", "Siddharth", "Gayathri", "Vivek", "Ritu", "Shiva", "Anusha", "Chandu", "Divakar",
      "Krishna", "Jyothi", "Mahesh", "Pallavi", "Aravind", "Bhanu", "Charan", "Kavya", "Ramesh", "Neha",
      "Surya", "Anil", "Varun", "Shreya", "Teja", "Akhil", "Harini", "Satish", "Kusuma", "Manasa",
      "Venu", "Deepthi", "Rahul", "Sanjana", "Naveen", "Likitha", "Vijay", "Mounika"
    ];

    const cities = [
      "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Mahbubnagar", "Adilabad",
      "Medak", "Siddipet", "Suryapet", "Nalgonda", "Jagtial", "Mancherial", "Sangareddy",
      "Vikarabad", "Kothagudem", "Bhadrachalam", "Yadadri",

      "Vijayawada", "Guntur", "Vizag", "Tirupati", "Nellore", "Kurnool", "Anantapur",
      "Rajahmundry", "Eluru", "Ongole", "Kadapa", "Srikakulam", "Vizianagaram",
      "Tenali", "Bhimavaram", "Machilipatnam", "Proddatur", "Hindupur",
      "Narasaraopet", "Chittoor", "Gudivada", "Tadepalligudem", "Amalapuram",
      "Kakinada", "Tanuku", "Nidadavole", "Gudur", "Chilakaluripet",
    ];
    const actions = [
      "joined RankHance today 🚀",
      "started practicing chapters 📚",
      "attempted first mock test 🎯",
      "scored 100+ marks 📈",
      "joined RankHance today 🚀",
      "scored 110+ marks 📈",
      "joined RankHance today 🚀",
      "scored 70+ marks 📈",
      "boosted score by 20 marks 🔥",
      "boosted score by 30 marks 🔥",
      "joined RankHance today 🚀",
      "boosted score by 40 marks 🔥",
      "improved accuracy to 85% 🎯",
      "joined RankHance today 🚀",
      "improved accuracy to 90% 🎯",
      "completed 5 mock tests 🧠",
      "completed 10 mock tests 🧠",
      "finished chapter practice 📘",
      "mastered weak topics 💪",
      "joined RankHance today 🚀",
      "analyzed performance deeply 📊",
      "joined RankHance today 🚀",
      "cracked tough questions 💥",
      "solved 100+ questions today ⚡",
      "joined RankHance today 🚀",
      "on a 7-day streak 🔥",
      "improving rank steadily 📈",
      "getting exam-ready 🎯",
      "building strong basics 🧱",
      "gaining confidence daily 💯",
      "focused on weak areas 🎯",
      "joined RankHance today 🚀",
      "tracking progress smartly 📊",
      "one step closer to rank 🏆",
      "joined RankHance today 🚀",
      "pushing limits daily 🚀",
      "consistent practice paying off 💪"
    ];

    const showPopup = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];

      setPopupMsg(`${name} from ${city} ${action}`);
      setPopupVisible(true);

      setTimeout(() => setPopupVisible(false), 4000);
    };

    // First popup delay (natural feel)
    const firstTimeout = setTimeout(() => {
      showPopup();
    }, 4000);

    // Random interval (not fixed → feels real)
    const interval = setInterval(() => {
      showPopup();
    }, Math.floor(Math.random() * 8000) + 12000); // 12s–20s

    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, []);

  useEffect(() => {
    let timer;
    if (quizStarted && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted && !quizFinished) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, timeLeft]);

  const finishQuiz = () => {
    setQuizFinished(true);
    let calcScore = 0;
    questions.forEach((q, idx) => {
      const correct = q.answer || q.correctAnswer || q.correctOption;
      if (correct && selectedAnswers[idx] === correct) {
        calcScore++;
      } else if (!correct && selectedAnswers[idx]) {
        calcScore++;
      }
    });
    setScore(calcScore);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (option) => {
    if (quizFinished) return;
    if (!quizStarted) setQuizStarted(true);

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
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-white via-orange-50 to-white text-center px-6 flex flex-col justify-center items-center">

        {/* 🔥 Background Glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-200/30 blur-[120px] rounded-full"></div>

        <Container className="relative z-10 space-y-10">

          {/* 🔝 TRUST BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-100 rounded-full shadow-sm text-sm font-medium text-gray-600">
            🔥 1000+ Students Already Preparing with RankHance
          </div>

          {/* 🧠 HEADLINE */}
          <div className="space-y-5">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Crack EAMCET 2026 <br />
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Get Your Dream Rank 🚀
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stop random preparation. Follow a proven system with
              <span className="font-semibold text-gray-900"> chapter-wise practice</span>,
              <span className="font-semibold text-gray-900"> real exam mocks</span>, and
              <span className="font-semibold text-gray-900"> smart analysis</span>.
            </p>
          </div>

          {/* 🎯 CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">

            <Link
              to="/dashboard"
              className="px-6 py-3 md:px-8 md:py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold text-base md:text-lg flex items-center justify-center gap-2 hover:scale-105"
            >
              Start Practicing →
            </Link>

            <button
              onClick={handleUnlockPremium}
              className="px-6 py-3 md:px-8 md:py-4 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:scale-105"
            >
              Update to Premium 👑
            </button>

          </div>

          <div className="flex justify-center mt-6">
            <Link
              to="/model-mock-results"
              className="group relative px-6 py-4 md:px-10 md:py-5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.5)] transition-all flex flex-col items-center justify-center border border-orange-200/50 hover:scale-[1.03] spark-border"
            >
              <span className="text-xl md:text-2xl font-semibold tracking-tight mb-1 drop-shadow-sm">Attend EAMCET 2026 Model Mock Test</span>
              <span className="inline-block bg-white text-orange-600 px-4 py-1 rounded-full text-sm md:text-base font-black shadow-sm uppercase tracking-wider">🔥 FREE!</span>

              <div className="absolute inset-0 rounded-3xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </Link>
          </div>

          {/* 📊 TRUST STATS */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 pt-6 text-sm text-gray-600">
            <span>📈 +30–50 Marks Improvement</span>
            <span>🎯 Real Exam Level Questions</span>
            <span>📊 Mock Test with Detailed Analysis</span>
          </div>

          {/* 🧊 PREMIUM CARD (VISUAL TRUST)
          <div className="mt-10 max-w-xl mx-auto bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl p-6 text-left">

            <p className="text-sm text-gray-500 mb-2">Recent Result</p>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Sai Teja (Hyderabad)</p>
                <p className="text-sm text-gray-500">EAMCET Aspirant</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-green-600">+42 Marks</p>
                <p className="text-xs text-gray-400">in 14 days</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600">
              “Focused practice + mock analysis helped me improve quickly.”
            </div>

          </div> */}

        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white px-4 md:px-0">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">

            {/* CARD */}
            <div className="group relative p-6 md:p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <div className="text-4xl font-extrabold text-gray-900 mb-1">4.8★</div>
              <div className="text-base font-semibold text-gray-800">Student Rating</div>
              <div className="text-sm text-gray-500 mt-1">Based on real aspirants</div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-yellow-200/10 blur-xl rounded-3xl"></div>
            </div>

            <div className="group relative p-6 md:p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <Users className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <div className="text-4xl font-extrabold text-gray-900 mb-1">1000+</div>
              <div className="text-base font-semibold text-gray-800">Active Students</div>
              <div className="text-sm text-gray-500 mt-1">Practicing daily</div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-orange-200/10 blur-xl rounded-3xl"></div>
            </div>

            <div className="group relative p-6 md:p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <div className="text-4xl font-extrabold text-gray-900 mb-1">50K+</div>
              <div className="text-base font-semibold text-gray-800">Questions Solved</div>
              <div className="text-sm text-gray-500 mt-1">Full syllabus covered</div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-green-200/10 blur-xl rounded-3xl"></div>
            </div>

          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-white scroll-mt-16 px-4 md:px-0">
        <Container>
          <div className="text-center space-y-4 mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Everything You Need to Crack EAMCET 2026
            </h2>
            <p className="text-gray-600 text-base md:text-lg px-2">
              Stop random preparation. Follow a structured system designed for real rank improvement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
            {[
              {
                icon: BookOpen,
                title: "Formulas Revision",
                desc: "Quick revision of 1st and 2nd year formulas",
                tag: "Master all key formulas"
              },
              {
                icon: BookOpen,
                title: "Foundation Practice",
                desc: "Build strong basics chapter by chapter",
                tag: "Never get stuck in concepts again"
              },
              {
                icon: Target,
                title: "Exam Level Questions",
                desc: "Solve real EAMCET questions topic-wise",
                tag: "Understand actual exam pattern"
              },
              {
                icon: CheckCircle,
                title: "Mock Tests",
                desc: "Attempt full 160-question exams",
                tag: "Know your real performance"
              },
              {
                icon: PieChart,
                title: "Weightage Analysis",
                desc: "Check chapter-wise weightage for EAMCET",
                tag: "Focus on high-yield topics"
              },
              {
                icon: Video,
                title: "Special Live Sessions",
                desc: "Join live mentorship & counselling",
                tag: "Learn from Toppers"
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group relative p-4 md:p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-0"
              >
                <div className="p-3 md:p-0 bg-orange-50 md:bg-transparent rounded-2xl md:rounded-none shrink-0 group-hover:scale-110 transition-transform">
                  <f.icon className="w-8 h-8 md:w-12 md:h-12 text-orange-500 mx-auto" />
                </div>

                <div className="flex-1 min-w-0 md:space-y-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-0 truncate md:whitespace-normal">{f.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-0 line-clamp-2 md:line-clamp-none">{f.desc}</p>

                  <div className="inline-block px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-orange-50 text-orange-600 font-semibold">
                    👉 {f.tag}
                  </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-orange-200/10 blur-[20px] rounded-3xl -z-10"></div>
              </div>
            ))}

            {/* FUTURE FEATURES (PREMIUM DIMMED STYLE) */}
            {[
              {
                icon: Building,
                title: "College Predictor",
                desc: "Know your college based on expected rank",
                tag: "Plan Ahead"
              }
            ].map((f, i) => (
              <div
                key={i}
                className="group relative p-4 md:p-6 rounded-3xl bg-gray-50 border border-gray-100 opacity-70 hover:opacity-100 transition-all duration-300 flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0"
              >
                <div className="p-3 md:p-0 bg-gray-200 md:bg-transparent rounded-2xl md:rounded-none shrink-0">
                  <f.icon className="w-8 h-8 md:w-10 md:h-10 text-orange-400 mx-auto" />
                </div>

                <div className="flex-1 min-w-0 md:space-y-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-0 truncate md:whitespace-normal">{f.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-0 line-clamp-2 md:line-clamp-none">{f.desc}</p>

                  <div className="inline-block px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-gray-200 text-gray-600 font-semibold">
                    🔒 {f.tag}
                  </div>
                </div>

                {/* Coming Soon Badge */}
                <div className="absolute top-3 right-3 md:top-3 md:right-3 text-[9px] md:text-[10px] bg-orange-100 text-orange-500 px-2 py-1 rounded-full font-semibold">
                  Soon
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Demo Mock Section */}
      <section className="py-16 md:py-20 bg-gray-50 px-4 md:px-0">
        <Container className="text-center space-y-8 md:space-y-10">
          <div className="space-y-3 md:space-y-4 px-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Experience Real Exam Feel 🎯
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Practice with real exam pressure, timer & question flow
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Loading mock test...</p>
            </div>
          ) : quizFinished ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Quiz Completed! ✅</h3>
              <p className="text-xl text-gray-600">
                You scored <span className="font-bold text-orange-500">{score}</span> out of {questions.length}
              </p>
              <p className="text-gray-500 mt-2">
                This was just a mini-demo. In the real app, we provide in-depth analysis, topic-wise strengths, and step-by-step solutions to help you identify weaknesses.
              </p>

              <div className="pt-6">
                <Link to="/login" className="inline-block">
                  <button className="bg-orange-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-semibold text-base md:text-lg shadow-lg hover:bg-orange-600 hover:scale-105 transition-all">
                    Try Full Mock Test →
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* LEFT SIDE */}
              <div className="bg-white p-6 rounded-3xl shadow-lx border border-gray-100 backdrop-blur-lg">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Question {currentIndex + 1} / {questions.length}</span>
                    <span className={`font-semibold ${timeLeft <= 30 ? 'text-red-500' : 'text-orange-500'}`}>
                      ⏱ {formatTime(timeLeft)}
                    </span>
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
                        className={`p-3 rounded-xl border cursor-pointer transition ${selectedAnswers[currentIndex] === opt
                          ? "bg-orange-100 border-orange-500"
                          : "hover:bg-orange-50"
                          }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 font-semibold"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => {
                      if (currentIndex === questions.length - 1) {
                        finishQuiz();
                      } else {
                        nextQuestion();
                      }
                    }}
                    className={`px-4 py-2 md:px-6 md:py-2 text-white rounded-lg font-semibold shadow-md transition-all ${currentIndex === questions.length - 1
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-orange-500 hover:bg-orange-600"
                      }`}
                  >
                    {currentIndex === questions.length - 1 ? "Submit" : "Next →"}
                  </button>
                </div>
              </div>
              {/* RIGHT SIDE */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl shadow-lg border border-orange-100 h-full flex flex-col justify-center text-center space-y-4">
                {!quizStarted ? (
                  <>
                    <h3 className="text-xl font-bold">Ready to Begin?</h3>
                    <p className="text-gray-600">Select any answer to start the 2-minute timer.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold">Your Progress</h3>
                    <p className="text-3xl font-bold text-orange-500">
                      {Object.keys(selectedAnswers).length} / {questions.length}
                    </p>
                    <p className="text-gray-600">Questions Attempted</p>
                  </>
                )}

              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Video Section */}

      {/* <section className="py-16 md:py-20 bg-white">
        <Container className="text-center space-y-10">

      ```
      <div className="space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          See How RankHance Works 🚀
        </h2>
        <p className="text-gray-600 text-lg">
          Watch how students improve their rank step-by-step
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <iframe
          className="w-full h-[220px] md:h-[420px] rounded-3xl"
          src="https://www.youtube.com/embed/uEAn72MgGUw"
          title="RankHance Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="text-sm text-gray-500">
        🎯 Real students • Real results • Real improvement
      </div>
      ```

        </Container>
      </section>  */}




      <section
        id="pricing"
        className="relative py-16 md:py-28 bg-gradient-to-b from-white via-orange-50 to-white scroll-mt-12 overflow-hidden px-4 md:px-0"
      >
        {/* 🔥 Background Glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-300/30 blur-[120px] rounded-full"></div>

        <Container className="relative z-10 space-y-10 md:space-y-14">

          {/* 🧠 HEADING */}
          <div className="text-center space-y-4 max-w-2xl mx-auto px-2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Choose Your Path to <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Top Rank 🚀
              </span>
            </h2>

            <p className="text-gray-600 text-base md:text-lg tracking-wide">
              Don’t leave your rank to chance. Choose a structured path that works.
            </p>
          </div>

          {/* 💳 PRICING CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">

            {/* 🧊 FREE PLAN */}
            <div className="p-6 md:p-8 rounded-3xl border border-gray-100 bg-white/70 backdrop-blur-xl shadow-md hover:shadow-xl transition-all flex flex-col justify-between">

              <div className="space-y-6">

                <div>
                  <h3 className="text-xl font-bold text-gray-900">Free Plan</h3>
                  <p className="text-gray-500 text-sm">
                    Try basics before upgrading
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-gray-700">

                  <li>✔ Basic chapter questions</li>
                  <li>✔ Limited practice access</li>

                  <li className="text-gray-400">✖ No full mock tests</li>
                  <li className="text-gray-400">✖ No performance analysis</li>
                  <li className="text-gray-400">✖ No exam simulation</li>
                  <li className="text-gray-400">✖ No 2 special guidance sessions</li>

                </ul>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                ⚠ Improvement is slow without proper guidance
              </div>

            </div>

            {/* 🔥 PREMIUM PLAN */}
            <div id="premium-plan" className="relative p-6 md:p-10 rounded-3xl bg-white border border-orange-200 shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02]">

              {/* 🔥 Glow Border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 to-orange-600 opacity-10 blur-xl"></div>

              {/* 🏆 BADGE */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-4 py-1 rounded-full shadow-md font-semibold">
                🔥 MOST POPULAR
              </div>

              <div className="relative z-10 space-y-6">

                <div>
                  <h3 className="text-xl font-bold text-orange-500">
                    Premium Plan
                  </h3>

                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-lg line-through text-gray-400">₹999</span>
                    <span className="text-4xl font-extrabold text-orange-500">
                      ₹99
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    One-time payment • Access up to your college joining date
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li>✔ Full-Length Mock Tests (160 Questions)</li>
                  <li>✔ Performance Tracking & Detailed Analysis</li>
                  <li>✔ Weightage-Based Exam Insights</li>
                  <li>✔ Chapter-Wise Structured Practice</li>
                  <li>✔ 2 Special Live Guidance Sessions</li>
                  <li>✔ Complete AP & TS Syllabus Coverage</li>
                </ul>

                {/* 💡 TRUST LINE */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-700">
                  🎯 Students improve 30–50 marks with this system
                </div>

              </div>

              {/* 🚀 CTA */}
              <button
                onClick={handleUnlockPremium}
                className="relative z-10 mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Unlock Premium Now →
              </button>

            </div>

          </div>

          {/* 💬 TRUST FOOTER */}
          <div className="text-center text-sm text-gray-500">
            💳 Secure payment • Instant access • No hidden charges • Fast and Accurate
          </div>

        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white px-4 md:px-0">
        <Container className="space-y-10 md:space-y-14">

          {/* HEADING */}
          <div className="text-center space-y-4 px-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Trusted by 1000+ EAMCET Aspirants 🚀
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Real students improving their scores with RankHance — not just words, real results.
            </p>
          </div>

          {/* TESTIMONIAL GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

            {/* CARD */}
            {[
              {
                name: "Ravi K.",
                role: "EAMCET Aspirant",
                text: "I improved 40+ marks in mocks. Now I finally have clarity on what to study.",
                result: "+42 Marks"
              },
              {
                name: "Anjali S.",
                role: "Student",
                text: "Mock tests feel exactly like the real exam. My time management improved a lot.",
                result: "Better Time Management"
              },
              {
                name: "Sai Teja",
                role: "Dropper",
                text: "Analysis showed my weak areas clearly. I stopped wasting time on random topics.",
                result: "Focused Preparation"
              },
              {
                name: "Priya M.",
                role: "Intermediate Student",
                text: "Before this I was randomly studying. Now I follow a proper strategy.",
                result: "Structured Learning"
              },
              {
                name: "Arun Reddy",
                role: "EAMCET 2025",
                text: "₹99 is nothing compared to the value I got. Highly recommended.",
                result: "High ROI"
              },
              {
                name: "Kiran",
                role: "Student",
                text: "Feels like real exam environment. My confidence increased a lot.",
                result: "Confidence Boost"
              }
            ].map((t, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* ⭐ Stars */}
                <div className="flex gap-1 mb-3 text-yellow-400">
                  {"★★★★★"}
                </div>

                {/* TEXT */}
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  “{t.text}”
                </p>

                {/* RESULT BADGE */}
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                  {t.result}
                </div>

                {/* USER */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold">
                    {t.name.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gradient-to-r from-orange-200/20 to-orange-400/20 blur-xl"></div>
              </div>
            ))}

          </div>

          {/* TRUST STRIP */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-gray-500">
            <span>✅ 1000+ Students</span>
            <span>📈 Avg +30–50 Marks Improvement</span>
            <span>💯 Real Exam Level Practice</span>
            <span>⭐ 4.8/5 Student Rating</span>
          </div>

          {/* 👥 TEAM SPOTLIGHT */}
          <div className="mt-24 mb-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="relative group cursor-pointer" onClick={() => navigate('/team')}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white border border-orange-100 p-8 md:p-12 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                {/* Decorative decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="text-center md:text-left space-y-3 z-10">
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                    Minds Behind RankHance 2026 <span className="text-3xl">👥</span>
                  </h3>
                  <p className="text-gray-500 font-medium max-w-md">
                    From expert developers to strategic advisors, meet the team working 24/7 to help you crack EAPCET 2026.
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 z-10 w-full md:w-auto">
                  <Link
                    to="/team"
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200 flex items-center gap-2"
                  >
                    Meet Our Team <span className="text-xl">🚀</span>
                  </Link>
                  <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">Built with passion ❤️</span>
                </div>
              </div>
            </div>
          </div>

        </Container>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 py-10 md:py-14 overflow-hidden">

        {/* 🔥 Background Glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full"></div>

        <Container className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 px-4 md:px-0">

          {/* LEFT SIDE */}
          <div className="space-y-5">

            <h3 className="text-2xl font-extrabold text-white tracking-wide">
              RankHance
            </h3>

            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Your smart preparation partner for EAMCET 2026. Practice with real exam level questions, track your progress, and achieve your dream rank.
            </p>

            <p className="text-sm text-orange-400 font-semibold">
              🚀 Start now. Improve daily. Crack your dream rank.
            </p>

            {/* CONTACT */}
            <div className="space-y-2 text-sm">

              <p className="text-gray-400">
                📧 For any issues:{" "}
                <a
                  href="mailto:rankhance.in@gmail.com"
                  className="text-orange-400 hover:text-orange-300 font-semibold transition"
                >
                  rankhance.in@gmail.com
                </a>
              </p>

              <p className="text-gray-400">
                💬 WhatsApp:{" "}
                <a
                  href="https://wa.me/9392609600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 font-semibold transition"
                >
                  Chat with us
                </a>
              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-start md:items-end space-y-4 text-sm mt-4 md:mt-0">

            <a href="/" className="hover:text-white transition hover:translate-x-1 duration-200">Home</a>
            <a href="/dashboard" className="hover:text-white transition hover:translate-x-1 duration-200">Practice</a>
            <a href="/mock-tests" className="hover:text-white transition hover:translate-x-1 duration-200">Mock Tests</a>
            <a href="#premium-plan" className="hover:text-white transition hover:translate-x-1 duration-200">Pricing</a>
            <a href="#features" className="hover:text-white transition hover:translate-x-1 duration-200">Features</a>

          </div>

        </Container>

        {/* 🔥 DIVIDER */}
        <div className="mt-16 border-t border-gray-800"></div>

        {/* BOTTOM */}
        <div className="text-center mt-8 space-y-4 px-4 md:px-6">

          <div className="flex justify-center flex-wrap gap-3 sm:gap-4 text-sm sm:text-base text-gray-400 font-medium">

            <a href="/terms" className="hover:text-white transition">Terms & Conditions</a>
            <span className="text-gray-600 hidden sm:inline">|</span>

            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <span className="text-gray-600 hidden sm:inline">|</span>

            <a href="/refund" className="hover:text-white transition">Refund Policy</a>
            <span className="text-gray-600 hidden sm:inline">|</span>

            <a href="/contact" className="hover:text-white transition">Contact Us</a>

          </div>

          {/* 💫 MINI TRUST LINE */}
          <p className="text-xs text-gray-500">
            Trusted by students across AP & TS • Built for serious aspirants 🚀
          </p>

          <div className="text-xs text-gray-600 pb-4 md:pb-0">
            © 2026 RankHance. All rights reserved.
          </div>

        </div>

      </footer>

      {popupVisible && (
        <div
          className={`
            fixed bottom-6 left-6 z-50
            flex items-center gap-3
            px-5 py-3
            rounded-2xl
            bg-white/80 backdrop-blur-xl
            border border-gray-100
            shadow-2xl
            transition-all duration-500
            animate-popup-in
          `}
        >
          {/* 🔴 LIVE DOT */}
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>

          {/* 👤 AVATAR */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-sm">
            {popupMsg.charAt(0)}
          </div>

          {/* 📝 TEXT */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm text-gray-900 font-semibold">
              {popupMsg.split(" ").slice(0, 1)}
            </span>
            <span className="text-xs text-gray-600">
              {popupMsg.replace(popupMsg.split(" ")[0], "")}
            </span>
          </div>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919392609600"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        aria-label="Chat with us on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-800">
          Chat for Query 💬
        </span>
      </a>

      <AnnouncementPopup />
    </div>
  );
}
