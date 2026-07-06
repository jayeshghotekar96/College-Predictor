import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../lib/DataContext';
import { getBestMatchingCategory } from '../lib/prediction';
import { Building2, MapPin, Target, Users, BookOpen, GraduationCap, Globe, Phone, Mail, ChevronRight, TrendingUp } from 'lucide-react';

export function CollegeDetails() {
  const { code } = useParams();
  const { data, loading, error } = useData();

  const college = useMemo(() => {
    if (!data || !code) return null;
    return data.colleges.find(c => c.collegeCode.toString() === code) || null;
  }, [data, code]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400">Loading details...</div>;
  if (error || !data) return <div className="flex-1 flex items-center justify-center text-red-400">Error loading data.</div>;
  if (!college) return <div className="flex-1 flex items-center justify-center text-slate-400">College not found.</div>;

  return (
    <div className="flex-1 w-full bg-slate-900 pb-20">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-900/40 to-slate-900 border-b border-white/5 pt-16 pb-12 overflow-hidden">
        
        {/* Background Patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
            <Link to="/colleges" className="hover:text-white transition-colors flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Colleges
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{college.district}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-400">{college.collegeCode}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-mono font-bold text-slate-200 border border-white/10">
                  Code: {college.collegeCode}
                </span>
                {college.collegeName.toLowerCase().includes('autonomous') && (
                  <span className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm font-semibold text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" /> Autonomous
                  </span>
                )}
                {college.collegeName.toLowerCase().includes('government') && (
                  <span className="px-3 py-1 bg-emerald-500/20 rounded-lg text-sm font-semibold text-emerald-300 border border-emerald-500/30">
                    Government
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight mb-4 max-w-4xl leading-tight">
                {college.collegeName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-300">
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> {college.district}, Maharashtra
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <BookOpen className="w-4 h-4 text-blue-400" /> {college.branches.length} Branches Offered
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Target className="w-4 h-4 text-indigo-400" /> NAAC / NBA Accredited (Est.)
                </span>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-row md:flex-col gap-3">
               <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2">
                 Predict My Chances
               </button>
               <button className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold border border-white/10 transition-all flex items-center justify-center gap-2">
                 Save to Shortlist
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Branch Offerings & Cutoffs */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-400" /> Branch Offerings & Cutoffs
                </h2>
                <span className="text-xs font-semibold text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  Based on General Open (2023-2025)
                </span>
             </div>

             <div className="space-y-4">
                {college.branches.map(branch => {
                  const bestOpenCategory = getBestMatchingCategory(branch.cutoffs, 'GOPENS') || 'GOPENS';
                  const gopensCutoffs = branch.cutoffs.filter(c => c.category === bestOpenCategory);
                  const latestYear = gopensCutoffs.length > 0 
                    ? Math.max(...gopensCutoffs.map(c => c.year)) 
                    : 'N/A';
                  
                  const latestCutoff = gopensCutoffs.find(c => c.year === latestYear);
                  const gopensPercentile = latestCutoff?.percentile;
                  
                  return (
                    <div key={branch.choiceCode} className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                            {branch.choiceCode}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-lg">{branch.courseName}</h3>
                        <p className="text-sm text-slate-400 mt-1">Intake: Approx 60-120 Seats • AICTE Approved</p>
                      </div>
                      
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Avg Cutoff ({latestYear})
                          {bestOpenCategory !== 'GOPENS' && <span className="ml-1 opacity-70 normal-case tracking-normal">[{bestOpenCategory}]</span>}
                        </div>
                        {gopensPercentile ? (
                          <div className="text-2xl font-mono font-extrabold text-emerald-400 flex items-center gap-1">
                            {gopensPercentile.toFixed(2)}%
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="text-lg font-mono font-bold text-slate-500">Data N/A</div>
                        )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>



        </div>

        {/* Sidebar Info (Right) */}
        <div className="space-y-6">
           <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-heading font-bold text-white text-lg mb-4">Contact Info</h3>
              
              <div className="space-y-4 text-sm font-medium text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                  <p>{college.collegeName}, {college.district}, Maharashtra, India - 400001</p>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                  <a href="#" className="text-blue-400 hover:underline">www.{college.district.toLowerCase()}engg.ac.in</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                  <span>+91 022-12345678</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500 shrink-0" />
                  <a href="mailto:info@college.edu" className="text-blue-400 hover:underline">info@college.edu</a>
                </div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-heading font-bold text-white text-lg mb-4">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {['Hostel (Boys/Girls)', 'Library', 'Sports Complex', 'Wi-Fi Campus', 'Cafeteria', 'Auditorium', 'Transport'].map(f => (
                  <span key={f} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-semibold text-slate-300 border border-white/5">
                    {f}
                  </span>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
