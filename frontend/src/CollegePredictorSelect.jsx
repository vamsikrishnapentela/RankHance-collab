import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from './components/Container';
import Card from './components/Card';
import { MapPin, ChevronRight, GraduationCap } from 'lucide-react';

export default function CollegePredictorSelect() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)] overflow-y-auto pt-24 sm:pt-28 pb-20">
      <Container className="max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="mb-8 w-full flex justify-start">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-orange-500 bg-white border shadow-sm px-3 py-1.5 rounded-lg transition-all"
          >
            ← Back
          </button>
        </div>

        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <GraduationCap className="w-8 h-8 text-orange-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
          College Predictor
        </h1>
        <p className="text-gray-500 text-center max-w-lg mb-12 font-medium text-sm md:text-base">
          Select your state to predict the best colleges based on previous year cutoff ranks and your performance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* AP Card */}
          <div onClick={() => navigate('/college-predictor/ap')} className="cursor-pointer h-full">
            <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-col items-center text-center gap-4 p-8">
                <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <MapPin className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AP EAMCET</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Predict colleges for Andhra Pradesh Engineering colleges.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  Continue <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          {/* TG Card */}
          <div onClick={() => navigate('/college-predictor/tg')} className="cursor-pointer h-full">
            <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-col items-center text-center gap-4 p-8">
                <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <MapPin className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">TS EAMCET</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Predict colleges for Telangana Engineering colleges.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  Continue <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

        </div>

      </Container>
    </div>
  );
}
