import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from './components/Container';
import Card from './components/Card';
import { MapPin, ChevronRight, GraduationCap, Search } from 'lucide-react';

export default function CollegePredictorSelect() {
  const navigate = useNavigate();

  // Fix auto-scrolling to bottom
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          Predict your future college based on your rank or search for specific college details.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl">
          
          {/* AP Card */}
          <div onClick={() => navigate('/college-predictor/ap')} className="cursor-pointer h-full">
            <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-row md:flex-col items-center md:items-center gap-4 p-4 sm:p-8 justify-between md:justify-center h-full">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 md:text-center text-left">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-2 leading-tight">AP EAMCET</h3>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed">
                    Predict colleges for Andhra Pradesh.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[13px] sm:text-sm bg-orange-50 px-3 py-1.5 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <span className="hidden md:block">Predict</span> <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          {/* TG Card */}
          <div onClick={() => navigate('/college-predictor/tg')} className="cursor-pointer h-full">
            <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-row md:flex-col items-center md:items-center gap-4 p-4 sm:p-8 justify-between md:justify-center h-full">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 md:text-center text-left">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-2 leading-tight">TS EAMCET</h3>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed">
                    Predict colleges for Telangana.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[13px] sm:text-sm bg-orange-50 px-3 py-1.5 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <span className="hidden md:block">Predict</span> <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search Card */}
          <div onClick={() => navigate('/college-predictor/search')} className="cursor-pointer h-full sm:col-span-2 lg:col-span-1">
            <Card hover className="group hover:scale-[1.02] transition-all duration-300 ease-in-out h-full border-2 border-transparent hover:border-orange-200">
              <div className="flex flex-row md:flex-col items-center md:items-center gap-4 p-4 sm:p-8 justify-between md:justify-center h-full">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 md:text-center text-left">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-2 leading-tight">Search Colleges</h3>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 leading-relaxed">
                    Search AP & TS Cutoffs.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[13px] sm:text-sm bg-orange-50 px-3 py-1.5 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <span className="hidden md:block">Search</span> <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

        </div>

      </Container>
    </div>
  );
}
