import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Target,
  Building2,
  BarChart3,
  BookOpen,
  User,
  ChevronRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MobileNav({ onOpenSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="lg:hidden flex items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm glass-panel bg-slate-900/95 border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-heading font-bold text-white text-lg tracking-tight">
                  Menu
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {/* Search Bar Trigger */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full glass-input px-4 py-3 rounded-xl flex items-center justify-between text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 cursor-pointer text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Colleges...
                  </span>
                </button>

                {/* Primary Nav Links */}
                <nav className="flex flex-col gap-2">
                  {[
                    {
                      name: "Predict",
                      path: "/predict",
                      icon: <Target className="w-5 h-5 text-emerald-400" />,
                    },
                    {
                      name: "Colleges",
                      path: "/colleges",
                      icon: <Building2 className="w-5 h-5 text-amber-400" />,
                    },
                    {
                      name: "Analytics",
                      path: "/analytics",
                      icon: <BarChart3 className="w-5 h-5 text-rose-400" />,
                    },
                    {
                      name: "Rank Estimator",
                      path: "/analytics/calculator",
                      icon: <BarChart3 className="w-5 h-5 text-rose-400" />,
                    },
                    {
                      name: "Resources",
                      path: "/resources",
                      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
                    },
                  ].map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleLinkClick(link.path)}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        {link.icon}
                        <span className="font-semibold text-slate-200 group-hover:text-white">
                          {link.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </nav>

                <hr className="border-white/5" />

                {/* User Section */}
                <div className="flex flex-col gap-3 pb-6">
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-inner">
                      G
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-bold text-sm text-white truncate">
                        Guest User
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        Local Storage
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLinkClick("/dashboard")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
