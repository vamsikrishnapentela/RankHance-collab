import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPredictorOptions, predictColleges } from './api';
import Container from './components/Container';
import Card from './components/Card';
import Button from './components/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, 
  MapPin, 
  BookOpen, 
  Filter, 
  Trophy, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  X,
  Building,
  Download,
  GraduationCap,
  Sparkles,
  Info,
  Zap
} from 'lucide-react';

export default function CollegePredictor() {
  const { state } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [options, setOptions] = useState({ districts: [], branches: [] });
  const [results, setResults] = useState(null);
  
  const [formData, setFormData] = useState({
    rank: '',
    category: 'OC',
    gender: 'Boys',
    selectedDistricts: [],
    selectedBranches: []
  });

  const categories = ['OC', 'EWS', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST'];
  const genders = ['Boys', 'Girls'];

  const branchMap = useMemo(() => {
    return options.branches.reduce((acc, b) => ({ ...acc, [b.code]: b.name }), {});
  }, [options.branches]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await getPredictorOptions(state);
        setOptions(data);
      } catch (err) {
        console.error("Failed to fetch options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [state]);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!formData.rank) return;
    
    setPredicting(true);
    try {
      const { results: data } = await predictColleges(state, {
        rank: formData.rank,
        category: formData.category,
        gender: formData.gender,
        districts: formData.selectedDistricts,
        branches: formData.selectedBranches
      });
      setResults(data);
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  const toggleSelection = (type, value) => {
    setFormData(prev => {
      const current = type === 'districts' ? prev.selectedDistricts : prev.selectedBranches;
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [type === 'districts' ? 'selectedDistricts' : 'selectedBranches']: updated
      };
    });
  };

  const getStatus = (cutoff, userRank) => {
    const rank = parseInt(userRank, 10);
    if (cutoff > rank * 1.15) return { label: 'Safe', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500', icon: <CheckCircle2 className="w-3 h-3" /> };
    if (cutoff >= rank * 0.95) return { label: 'Good Chance', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', icon: <Zap className="w-3 h-3" /> };
    if (cutoff >= rank * 0.75) return { label: 'Chance', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500', icon: <Info className="w-3 h-3" /> };
    return { label: 'Difficult', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500', icon: <AlertCircle className="w-3 h-3" /> };
  };

  const downloadPDF = () => {
    if (!results || results.length === 0) return;

    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const addWatermark = (pdfDoc) => {
          pdfDoc.setTextColor(240, 240, 240);
          pdfDoc.setFontSize(60);
          pdfDoc.setFont(undefined, 'bold');
          pdfDoc.saveGraphicsState();
          pdfDoc.setGState(new pdfDoc.GState({ opacity: 0.2 }));
          pdfDoc.text("RANKHANCE", pageWidth / 2, pageHeight / 2, {
            align: 'center',
            angle: 45
          });
          pdfDoc.restoreGraphicsState();
        };

        addWatermark(doc);

        doc.setTextColor(255, 92, 26);
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text(`RankHance ${state.toUpperCase()} College Predictor`, 14, 20);

        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Rank: ${formData.rank} | Category: ${formData.category} | Gender: ${formData.gender}`, 14, 28);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

        const tableData = results.map((college, idx) => [
          idx + 1,
          college.inst_code || college.institute_code || 'N/A',
          college.institute_name,
          branchMap[college.branch_code] || college.branch_name || college.branch_code,
          college.place,
          college.target_last_rank.toLocaleString()
        ]);

        autoTable(doc, {
          startY: 40,
          head: [['S.No', 'Code', 'Institute Name', 'Branch', 'Place', 'Last Rank']],
          body: tableData,
          headStyles: { fillColor: [255, 92, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 15, fontStyle: 'bold' },
            3: { cellWidth: 35 },
            5: { fontStyle: 'bold', halign: 'right' }
          },
          didDrawPage: (data) => {
            if (data.pageNumber > 1) addWatermark(doc);
          }
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const disclaimer = `Note: Please take this report for reference only. We show colleges within a range of 2,000 ranks before to 10,000 ranks after your provided rank to give you a broad perspective of both better and safer colleges. We have calculated these results based on previous year data. Actual admission may slightly vary from year to year. Rank: ${formData.rank} | Category: ${formData.category}`;
        const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
        doc.text(splitDisclaimer, 14, finalY);

        doc.save(`RankHance_Predictions_${formData.rank}.pdf`);
    } catch (err) {
        console.error("PDF Generation error:", err);
        alert("Failed to generate PDF.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-screen pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isAP = state?.toLowerCase() === 'ap';

  return (
    <div className="flex-1 w-full bg-gray-50 flex flex-col p-4 md:p-6 min-h-screen pt-24 pb-20 overflow-x-hidden">
      <Container className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-row items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/college-predictor')}
            className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:text-orange-500 transition-all shrink-0"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {state.toUpperCase()} College Predictor <GraduationCap className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />
            </h1>
            <p className="text-gray-500 text-[10px] md:text-sm font-semibold tracking-wider opacity-60">
              Seat Forecasting & Analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <Card className="p-6 md:p-8 shadow-xl border-none bg-white rounded-3xl max-h-[calc(100vh-140px)] flex flex-col">
              <div className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-orange-100 space-y-6 pb-4">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Your Rank</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="e.g., 25000"
                      value={formData.rank}
                      onChange={(e) => setFormData({...formData, rank: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-400 focus:bg-white transition-all font-bold text-xl outline-none"
                    />
                    <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-200 w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-400 font-bold text-sm appearance-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-400 font-bold text-sm appearance-none cursor-pointer"
                    >
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Branches (Optional)</label>
                      <span className="text-[9px] text-gray-400 px-1 font-medium italic">If none selected, all branches considered</span>
                    </div>
                    {formData.selectedBranches.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, selectedBranches: []})}
                        className="text-[10px] font-bold text-orange-500"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-orange-200">
                    {options.branches.map(branch => (
                      <label key={branch.code} className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-orange-50 cursor-pointer transition-all group border border-transparent hover:border-orange-100 shadow-sm bg-white">
                        <input
                          type="checkbox"
                          checked={formData.selectedBranches.includes(branch.code)}
                          onChange={() => toggleSelection('branches', branch.code)}
                          className="w-4 h-4 rounded border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900 leading-tight">{branch.name}</p>
                          <p className="text-[9px] text-orange-400 font-bold uppercase">{branch.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Districts (Optional)</label>
                      <span className="text-[9px] text-gray-400 px-1 font-medium italic">If none selected, all districts considered</span>
                    </div>
                    {formData.selectedDistricts.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, selectedDistricts: []})}
                        className="text-[10px] font-bold text-orange-500"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-orange-200">
                    {options.districts.map(dist => (
                      <label key={dist.code} className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-orange-50 cursor-pointer transition-all group border border-transparent hover:border-orange-100 shadow-sm bg-white">
                        <input
                          type="checkbox"
                          checked={formData.selectedDistricts.includes(dist.code)}
                          onChange={() => toggleSelection('districts', dist.code)}
                          className="w-4 h-4 rounded border-gray-200 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-gray-700 group-hover:text-gray-900">{dist.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-gray-50">
                <Button 
                  onClick={handlePredict}
                  disabled={predicting || !formData.rank} 
                  className="w-full h-14 shadow-lg shadow-orange-500/20 text-md rounded-2xl"
                >
                  {predicting ? 'Processing...' : 'Predict Now →'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-8">
            {!results ? (
              <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 text-orange-400">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Your Future</h2>
                <p className="text-gray-500 max-w-sm font-medium">Enter your rank and details to see tailored college suggestions.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-red-100 flex flex-col items-center justify-center min-h-[450px]">
                <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
                <p className="text-gray-500 max-w-sm font-medium mb-6">Try expanding your rank range or selecting more options.</p>
                <button onClick={() => setResults(null)} className="text-orange-500 font-bold hover:underline">Clear Search</button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                
                <div className="px-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-orange-500" />
                      Found {results.length} Possibilities
                    </h2>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-2xl border border-orange-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm text-xs"
                    >
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                  </div>
                  
                  <Card className="bg-blue-50/40 border-none p-5 rounded-2xl">
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-blue-900 font-bold leading-tight">
                          Please take this for reference only.
                        </p>
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed opacity-90">
                           We show colleges with cutoffs ranging from 2k before to 10k after your rank ({formData.rank}) to give you a broad perspective of both better and safer colleges.
                        </p>
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed opacity-90">
                          We have calculated these results based on previous year cutoff data. Actual admission may slightly vary from year to year depending on current counseling rules and competition.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 pb-12">
                  {results.map((college, idx) => {
                    const status = getStatus(college.target_last_rank, formData.rank);
                    return (
                      <Card key={idx} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[1.5rem] bg-white">
                        <div className="flex flex-col md:flex-row md:items-stretch">
                          
                          {/* Cutoff Section */}
                          <div className={`md:w-32 ${status.bg} p-5 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100/50`}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cutoff</p>
                            <p className={`text-xl font-bold ${status.color}`}>{college.target_last_rank.toLocaleString()}</p>
                            <div className={`mt-3 px-2.5 py-1 ${status.bg} border border-current opacity-70 ${status.color} text-[9px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1`}>
                               {status.icon} {status.label}
                            </div>
                          </div>

                          {/* Detail Section */}
                          <div className="flex-1 p-5 md:p-6 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2 flex-1">
                                <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight group-hover:text-orange-500 transition-colors">
                                  {college.institute_name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wide">
                                    <MapPin className="w-3 h-3" /> {college.place}, {college.dist}
                                  </span>
                                  <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wide border border-orange-100">
                                    <Building className="w-3 h-3" /> Code: {college.inst_code || college.institute_code}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-50 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Branch Offered</p>
                                  <p className="text-xs font-bold text-gray-700 tracking-tight">
                                    {branchMap[college.branch_code] || college.branch_name || college.branch_code}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold rounded-lg uppercase tracking-widest">
                                  {college.type || college.institute_type || 'PVT'}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </Container>
    </div>
  );
}
