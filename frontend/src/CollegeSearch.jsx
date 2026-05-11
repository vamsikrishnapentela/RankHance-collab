import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from './components/Container';
import { MapPin, GraduationCap, Search, X, Building2, Tag } from 'lucide-react';
import { searchCollege, getCollegeDetails } from './api';

export default function CollegeSearch() {
  const navigate = useNavigate();
  
  // Search states
  const [apQuery, setApQuery] = useState('');
  const [apResults, setApResults] = useState([]);
  const [tgQuery, setTgQuery] = useState('');
  const [tgResults, setTgResults] = useState([]);
  
  // Detail states
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fix auto-scrolling to bottom
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search logic for AP
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (apQuery.trim().length >= 1) {
        try {
          const res = await searchCollege('ap', apQuery);
          setApResults(res);
        } catch (err) {
          console.error(err);
        }
      } else {
        setApResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [apQuery]);

  // Search logic for TG
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (tgQuery.trim().length >= 1) {
        try {
          const res = await searchCollege('tg', tgQuery);
          setTgResults(res);
        } catch (err) {
          console.error(err);
        }
      } else {
        setTgResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tgQuery]);

  const handleSelectCollege = async (state, code) => {
    setLoadingDetails(true);
    try {
      const details = await getCollegeDetails(state, code);
      setSelectedCollege({
        state,
        data: details
      });
      // Clear searches
      setApQuery('');
      setTgQuery('');
      setApResults([]);
      setTgResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-6 min-h-[calc(100dvh-64px)] overflow-y-auto pt-24 sm:pt-28 pb-20">
      <Container className="max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="mb-8 w-full flex justify-start">
          <button
            onClick={() => navigate('/college-predictor')}
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-orange-500 bg-white border shadow-sm px-3 py-1.5 rounded-lg transition-all"
          >
            ← Back
          </button>
        </div>

        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Search className="w-8 h-8 text-blue-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
          Search AP & TS Colleges
        </h1>
        <p className="text-gray-500 text-center max-w-lg mb-12 font-medium text-sm md:text-base">
          Find any college in AP or TS and explore all branches and cutoff ranks.
        </p>

        {/* --- SEARCH SECTION --- */}
        <div className="w-full max-w-3xl mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Search AP */}
           <div className="relative group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Search AP Colleges</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Enter name or code..."
                  value={apQuery}
                  onChange={(e) => setApQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-700 shadow-sm"
                />
              </div>
              
              {apResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {apResults.map((col) => (
                    <button
                      key={col.code}
                      onClick={() => handleSelectCollege('ap', col.code)}
                      className="w-full flex flex-col items-start px-5 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 group/item"
                    >
                      <span className="font-bold text-gray-800 group-hover/item:text-orange-600 transition-colors text-sm text-left">{col.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-tighter">{col.code}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium italic">
                          <MapPin className="w-3 h-3" /> {col.place}, {col.dist}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
           </div>

           {/* Search TG */}
           <div className="relative group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Search TG Colleges</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Enter name or code..."
                  value={tgQuery}
                  onChange={(e) => setTgQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-700 shadow-sm"
                />
              </div>

              {tgResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {tgResults.map((col) => (
                    <button
                      key={col.code}
                      onClick={() => handleSelectCollege('tg', col.code)}
                      className="w-full flex flex-col items-start px-5 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 group/item"
                    >
                      <span className="font-bold text-gray-800 group-hover/item:text-orange-600 transition-colors text-sm text-left">{col.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-tighter">{col.code}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium italic">
                          <MapPin className="w-3 h-3" /> {col.place}, {col.dist}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* --- COLLEGE DETAIL MODAL --- */}
        {selectedCollege && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedCollege(null)}></div>
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative">
                <button 
                  onClick={() => setSelectedCollege(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest">{selectedCollege.state.toUpperCase()} EAMCET</span>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">{selectedCollege.data[0].inst_code || selectedCollege.data[0].institute_code}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight italic uppercase tracking-tight">{selectedCollege.data[0].institute_name}</h2>
                    <div className="flex items-center gap-4 mt-3 text-gray-400 font-medium text-sm">
                       <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> {selectedCollege.data[0].place}, {selectedCollege.data[0].dist || selectedCollege.data[0].dist_code}</span>
                       <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-orange-500" /> {selectedCollege.data[0].type || selectedCollege.data[0].institute_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                <div className="grid grid-cols-1 gap-6">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-orange-500" /> 
                    Available Branches & Cutoffs
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedCollege.data.map((item, idx) => (
                      <div key={idx} className="bg-white border-2 border-gray-100 rounded-[1.5rem] p-6 hover:border-orange-200 transition-all group shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-inner">
                              {item.branch_code}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-1">{item.branch_name}</h5>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Branch Code: {item.branch_code}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 md:justify-end">
                             {Object.entries(item.last_ranks || {}).map(([cat, rank]) => {
                               if (!rank || rank === "N/A" || rank === "0") return null;
                               return (
                                 <div key={cat} className="flex flex-col items-center min-w-[70px] bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 group-hover:border-orange-100 transition-colors">
                                   <span className="text-[9px] font-black text-gray-400 uppercase mb-1">{cat.replace('_', ' ')}</span>
                                   <span className="text-sm font-black text-gray-900">{parseInt(rank).toLocaleString()}</span>
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedCollege(null)}
                  className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all shadow-lg active:scale-95"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}
