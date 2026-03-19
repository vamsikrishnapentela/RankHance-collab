import { Link } from 'react-router-dom';
import { BookOpen, Zap, Lock, Edit3, ChevronRight } from 'lucide-react';
import Card from './components/Card';


export default function Dashboard() {
  const cards = [
    {
      title: 'Foundation Practice',
      description: 'Build strong basics chapter by chapter',
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      link: '/subjects?type=quiz',
      active: true,
      color: 'bg-orange-100'
    },
    {
      title: 'Exam Questions Practise ',
      description: 'Solve real exam questions chapter by chapter',
      icon: <BookOpen className="w-8 h-8 text-orange-500" />,
      link: '/subjects?type=practice',
      active: true,
      color: 'bg-orange-100'
    },
    
    {
      title: 'Mock Test',
      description: 'Attempt 160-question mock tests like EAPCET',
      icon: <Edit3 className="w-8 h-8 text-orange-500" />,
      link: '/mock-tests',
      active: true,
      color: 'bg-orange-100'
    },

    {
      title: 'Previous Year Papers',
      description: 'Solve past EAMCET papers with solutions',
      icon: <Lock className="w-8 h-8 text-gray-400" />,
      link: '#',
      active: false,
      color: 'bg-gray-100'
    },
    {
      title: 'Formula Cheat Sheets',
      description: 'Quick revision formulas for all subjects',
      icon: <Lock className="w-8 h-8 text-gray-400" />,
      link: '#',
      active: false,
      color: 'bg-gray-100'
    },
    {
      title: 'Subject Wise Tests',
      description: 'Test your strength in single subjects',
      icon: <Lock className="w-8 h-8 text-gray-400" />,
      link: '#',
      active: false,
      color: 'bg-gray-100'
    },
    {
      title: 'Weakness Analysis',
      description: 'Detailed insights of where you go wrong',
      icon: <Lock className="w-8 h-8 text-gray-400" />,
      link: '#',
      active: false,
      color: 'bg-gray-100'
    }
  ];

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 w-full text-center tracking-tight">
          Welcome! What do you want to practice today?
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            if (card.active) {
              return (
                <Link 
                  key={index} 
                  to={card.link}
                >
                  <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out">
                    <div className="flex flex-col items-start gap-6 justify-between h-full p-6">
                      <div className={`p-4 rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">{card.description}</p>
                      </div>
                      <div className="mt-6 pt-4 flex w-full justify-between items-center text-[var(--color-primary)] font-bold">
                        <span>Start</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            } else {
              return (
                <div 
                  key={index} 
                  className="card p-6 flex flex-col items-start gap-4 opacity-75 grayscale cursor-not-allowed w-full shadow-sm"
                >
                  <div className={`p-4 rounded-2xl ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">{card.title}</h3>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed">{card.description}</p>
                  </div>
                  <div className="mt-auto pt-4 flex w-full justify-between items-center text-gray-400 font-bold">
                    <span>Coming soon</span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
