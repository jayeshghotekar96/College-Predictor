import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, History, TrendingUp, Building2, MapPin, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // We trigger the open via a custom event so Header can manage state, 
          // but since this component is rendered inside Header, we just rely on Header's event listener.
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (term: string) => {
    onClose();
    // In a real app we'd navigate to a search results page or set filters
    navigate(`/colleges?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] px-4"
            onClick={onClose}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[80vh]"
            >
              
              {/* Search Input Area */}
              <div className="relative flex items-center px-4 py-4 border-b border-white/5 bg-white/5">
                <Search className="w-6 h-6 text-slate-400 absolute left-6" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search colleges, branches, districts, or choice codes..."
                  className="w-full bg-transparent border-none outline-none text-white text-lg pl-12 pr-12 font-medium placeholder:text-slate-500"
                />
                
                {query ? (
                  <button onClick={() => setQuery('')} className="absolute right-6 p-1 bg-white/10 rounded-full hover:bg-white/20 text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute right-6 flex items-center gap-1 opacity-50">
                    <kbd className="px-2 py-1 bg-black/40 rounded-md border border-white/10 text-[10px] font-mono font-bold text-white flex items-center gap-1">
                      <Command className="w-3 h-3" /> K
                    </kbd>
                  </div>
                )}
              </div>

              {/* Scrollable Results Area */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                
                {query ? (
                  // Active Search Results 
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Matches</h3>
                      <div className="space-y-1">
                        <button onClick={() => handleSearch(query)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-white/10">
                          <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Search className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-white font-medium text-sm">Search for "{query}"</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Default State (Recent & Trending)
                  <div className="space-y-8 py-2">
                    
                    {/* Recent */}
                    <div>
                      <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <History className="w-3 h-3" /> Recent Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['VJTI Mumbai', 'COEP Pune', 'Computer Science', 'Pune District'].map(term => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending Categories */}
                    <div>
                      <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Trending Explorer
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        
                        <button onClick={() => navigate('/colleges?type=Govt')} className="flex flex-col p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-left group">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-sm text-slate-200 group-hover:text-white">Top Government Colleges</span>
                          </div>
                          <span className="text-xs text-slate-500">Explore state-funded autonomous institutes</span>
                        </button>
                        
                        <button onClick={() => navigate('/predict?tab=heatmap')} className="flex flex-col p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-left group">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="font-semibold text-sm text-slate-200 group-hover:text-white">Pune vs Mumbai</span>
                          </div>
                          <span className="text-xs text-slate-500">Compare district competitiveness</span>
                        </button>
                        
                        <button onClick={() => navigate('/analytics/trends')} className="flex flex-col p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-left group">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-amber-400" />
                            <span className="font-semibold text-sm text-slate-200 group-hover:text-white">CS / IT Cutoffs</span>
                          </div>
                          <span className="text-xs text-slate-500">Branch specific percentile trends</span>
                        </button>
                        
                      </div>
                    </div>

                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">↑</kbd><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">↵</kbd> to select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10">esc</kbd> to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
