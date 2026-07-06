import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Globe, LayoutDashboard } from 'lucide-react';

export function UserActions({ onOpenSearch }: { onOpenSearch: () => void }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'EN' | 'MR'>('EN');

  // Badge notification count mock
  const notificationCount = 2;

  const toggleLang = () => setLang(prev => prev === 'EN' ? 'MR' : 'EN');

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      
      {/* Global Search Trigger (Desktop) */}
      <button
        onClick={onOpenSearch}
        className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-400 hover:text-white cursor-pointer group"
      >
        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium mr-4">Search...</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-black/40 rounded text-[10px] font-mono border border-white/10">⌘K</kbd>
      </button>
      
      {/* Search Icon (Mobile/Tablet) */}
      <button onClick={onOpenSearch} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
        <Search className="w-5 h-5" />
      </button>

      {/* Language Switcher */}
      <button 
        onClick={toggleLang}
        className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold font-heading"
        title="Switch Language"
      >
        <Globe className="w-4 h-4 text-emerald-400" />
        {lang}
      </button>

      {/* Notifications */}
      <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
        <Bell className="w-5 h-5 hover:animate-[wiggle_1s_ease-in-out_infinite]" />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      {/* Dashboard Button */}
      <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          My Dashboard
        </button>
      </div>
    </div>
  );
}
