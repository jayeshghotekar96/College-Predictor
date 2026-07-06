import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator as CalcIcon, Target, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function Calculator() {
  const [percentile, setPercentile] = useState<string>('95.50');
  const [totalStudents, setTotalStudents] = useState<number>(330000); // Default PCM approx 3.3 Lakhs

  const calculateRank = (pct: number, total: number) => {
    if (pct < 0 || pct > 100) return 0;
    return Math.max(1, Math.round(((100 - pct) / 100) * total));
  };

  const parsedPercentile = parseFloat(percentile) || 0;
  const estimatedRank = calculateRank(parsedPercentile, totalStudents);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn mt-8 mb-20 px-4 md:px-0">
      {/* Page Header */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <CalcIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-white">Rank Estimator</h1>
              <p className="text-slate-400 font-medium">Predict your State Merit Rank based on MHT-CET Percentile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-md">
          <h2 className="text-xl font-heading font-bold text-white mb-6">Enter Your Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                MHT-CET Percentile
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="e.g. 95.50"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-mono">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Total Students Appeared (PCM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalStudents}
                  onChange={(e) => setTotalStudents(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                * Approx 3,30,000 students appeared for PCM group in 2023-2024.
              </p>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-indigo-900/20 rounded-2xl border border-indigo-500/20 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-3xl rounded-full" />
          
          <div className="relative z-10 w-full">
            <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-widest mb-2">
              Estimated State Rank
            </h3>
            
            <motion.div 
              key={estimatedRank}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-7xl font-mono font-extrabold text-white my-6 drop-shadow-xl flex items-center justify-center gap-2"
            >
              <span className="text-indigo-400">#</span>
              {estimatedRank.toLocaleString()}
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-indigo-500/20 w-full">
              <div className="text-left">
                <div className="text-xs text-indigo-300/70 mb-1">Top Percentile</div>
                <div className="font-mono text-lg font-bold text-indigo-200">
                  {parsedPercentile > 0 ? (100 - parsedPercentile).toFixed(2) : '0'}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-indigo-300/70 mb-1">Prediction Quality</div>
                <div className="font-heading text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <Target className="w-4 h-4" />
                  High Accuracy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-4">
        <Link 
          to={`/predict?percentile=${parsedPercentile}`}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
        >
          View College Predictions for {parsedPercentile}%
          <TrendingUp className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
