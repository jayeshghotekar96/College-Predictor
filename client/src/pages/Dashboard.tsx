import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShortlist } from '../hooks/useShortlist';
import { Target, BookOpen, Clock, Building2, CheckCircle2, ChevronRight, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { shortlist, remove } = useShortlist();
  
  // CAP 2026 Schedule
  const capSteps = [
    { name: 'CAP Registration & Upload', status: 'active', date: 'July 2 – July 12, 2026' },
    { name: 'Document Verification', status: 'active', date: 'July 3 – July 13, 2026' },
    { name: 'Grievance Submission', status: 'pending', date: 'July 16 – July 18, 2026' },
    { name: 'Final Merit List', status: 'pending', date: 'July 20, 2026' },
    { name: 'CAP Seat Allotment Rounds', status: 'pending', date: 'Starts after Merit List' },
  ];

  return (
    <div className="flex-1 w-full bg-slate-900 pb-20">
      
      {/* Dashboard Header */}
      <div className="bg-slate-800/50 border-b border-white/5 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg border border-white/10">
              G
            </div>
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">
                Welcome back, Guest
              </h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Target Percentile: <span className="text-white font-mono font-semibold">95.40%</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bookmark className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-2xl font-bold font-mono text-white">{shortlist.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Saved Colleges</h3>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-2xl font-bold font-mono text-white">4</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Option Forms</h3>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-2xl font-bold font-mono text-white">12</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Recent Searches</h3>
            </div>
          </div>

          {/* Saved Colleges List */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Your Shortlist
              </h2>
              <Link to="/predict" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold">
                Explore More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {shortlist.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>Your shortlist is empty.</p>
                  <Link to="/predict" className="text-blue-400 hover:underline mt-2 inline-block">Find colleges to save</Link>
                </div>
              ) : (
                shortlist.map(item => (
                  <div key={`${item.collegeCode}-${item.choiceCode}`} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-white/5 transition-colors group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {item.choiceCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                          {item.district}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.collegeName}
                      </h3>
                      <p className="text-sm text-slate-400 mt-0.5">{item.courseName}</p>
                    </div>
                    
                    <button
                      onClick={() => remove(item.choiceCode)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Area (Right Column) */}
        <div className="space-y-8">
          
          {/* CAP Progress Tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-heading font-bold text-white mb-6">CAP Progress</h2>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              
              {capSteps.map((step, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-slate-900 ${
                    step.status === 'completed' ? 'border-emerald-500 text-emerald-400' :
                    step.status === 'active' ? 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                    'border-slate-700 text-slate-600'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                     step.status === 'active' ? <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" /> :
                     <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  
                  <div>
                    <h4 className={`font-bold text-sm ${
                      step.status === 'completed' ? 'text-slate-300' :
                      step.status === 'active' ? 'text-white' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Profile Completion */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-heading font-bold text-white mb-2">Profile Setup</h2>
            <p className="text-xs text-slate-400 mb-4">Complete your profile to get more accurate predictions.</p>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="space-y-3 mt-5">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group text-sm">
                <span className="flex items-center gap-2 text-slate-300 line-through opacity-50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Account Created
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors group text-sm">
                <span className="flex items-center gap-2 text-blue-400 font-semibold">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400" /> Enter CET Scores
                </span>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600" /> Verify Category Document
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
