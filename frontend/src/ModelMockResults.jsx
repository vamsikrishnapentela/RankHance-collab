import { Trophy, Mail, User, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from './components/Container';
import Button from './components/Button';

export default function ModelMockResults() {
  const topStudents = [
    { rank: 1, name: "nrlife", email: "nrethome2021@gmail.com", score: 138, trophy: "🥇" },
    { rank: 2, name: "eesha2025 dachepally", email: "dachepallyeesha@gmail.com", score: 119, trophy: "🥈" },
    { rank: 3, name: "Bharath kumar", email: "bharathracharla1888@gmail.com", score: 58, trophy: "🥉" },
    { rank: 4, name: "Kouser Fatima", email: "fatimakouser75@gmail.com", score: 56, trophy: "#4" },
    { rank: 5, name: "Rakesh reddy", email: "kalyanreddynalavala@gmail.com", score: 54, trophy: "#5" }
  ];

  return (
    <div className="pt-24 pb-12 flex-1 w-full bg-gray-50 min-h-[calc(100dvh-64px)]">
      <Container className="max-w-4xl space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 border border-orange-200 rounded-full text-sm font-bold text-orange-600 animate-pulse">
            <Trophy className="w-4 h-4" /> Contest Status: Ended
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            EAMCET 2026 Model Mock Test <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Batch 1 Results 🏆
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The contest has ended for this time. Congratulations to all the participants! 
            Below are the top performers who showed exceptional talent.
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" /> Top 5 Students
            </h2>
            <span className="text-gray-400 text-sm font-medium">Batch 1 • April 12, 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <th className="p-5 border-b text-center w-24">Rank</th>
                  <th className="p-5 border-b">Student Details</th>
                  <th className="p-5 border-b text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, idx) => (
                  <tr key={idx} className="group hover:bg-orange-50/30 transition-colors border-b last:border-b-0">
                    <td className="p-5 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold ${
                        student.rank <= 3 ? 'bg-orange-100 text-orange-600 shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {student.trophy}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors capitalize">
                          {student.name}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {student.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full font-black text-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                        {student.score}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 md:p-12 text-center border border-orange-200 relative overflow-hidden">
          <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/40 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Want to see your name here next time?</h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              Unlock access to 40+ Premium Mock Tests, Chapter-wise analysis, and expert guidance to boost your EAMCET 2026 score.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/dashboard">
                <Button className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2">
                  Start Practicing Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-2xl font-bold transition-all">
                  Join Next Batch
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
