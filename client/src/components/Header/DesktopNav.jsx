import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Target,
  Building2,
  BarChart3,
  BookOpen,
  Search,
  MapPin,
  GraduationCap,
  ArrowRight,
  LayoutDashboard,
  Calculator,
} from "lucide-react";

const MENU_ITEMS = [
  {
    title: "Predict",
    icon: <Target className="w-4 h-4" />,
    path: "/predict",
    submenu: [
      {
        name: "College Prediction",
        path: "/predict",
        icon: <Target className="w-4 h-4 text-blue-400" />,
        desc: "Find matches based on your percentile",
      },
      {
        name: "Reverse Predictor",
        path: "/predict?tab=reverse",
        icon: <Search className="w-4 h-4 text-indigo-400" />,
        desc: "See required percentile for colleges",
      },
      {
        name: "Competitiveness Heatmap",
        path: "/predict?tab=heatmap",
        icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        desc: "Visualize district-wise competition",
      },
      {
        name: "Branch Predictor",
        path: "/predict?branch=CS",
        icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />,
        desc: "Specialized CS/IT/AI predictions",
      },
    ],
  },
  {
    title: "Colleges",
    icon: <Building2 className="w-4 h-4" />,
    path: "/colleges",
    submenu: [
      {
        name: "College Explorer",
        path: "/colleges",
        icon: <Building2 className="w-4 h-4 text-amber-400" />,
        desc: "Browse all 384+ institutions",
      },
      {
        name: "Top Colleges",
        path: "/colleges?sort=top",
        icon: <GraduationCap className="w-4 h-4 text-yellow-400" />,
        desc: "VJTI, COEP, SPIT & more",
      },
      {
        name: "Government Institutes",
        path: "/colleges?type=Govt",
        icon: <Building2 className="w-4 h-4 text-blue-400" />,
        desc: "State-funded engineering colleges",
      },
      {
        name: "Autonomous",
        path: "/colleges?type=Autonomous",
        icon: <Target className="w-4 h-4 text-purple-400" />,
        desc: "Institutes with academic autonomy",
      },
    ],
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    path: "/analytics",
    submenu: [
      {
        name: "Cutoff Trends (2023-25)",
        path: "/analytics/trends",
        icon: <BarChart3 className="w-4 h-4 text-rose-400" />,
        desc: "Year-over-year shifting cutoffs",
      },
      {
        name: "Rank Estimator",
        path: "/analytics/calculator",
        icon: <Calculator className="w-4 h-4 text-emerald-400" />,
        desc: "Convert percentile to state rank",
      },
      {
        name: "Category Insights",
        path: "/analytics/category",
        icon: <LayoutDashboard className="w-4 h-4 text-orange-400" />,
        desc: "Reservation quota analysis",
      },
    ],
  },
  {
    title: "Resources",
    icon: <BookOpen className="w-4 h-4" />,
    path: "/resources",
    submenu: [
      {
        name: "CAP Process Guide",
        path: "/resources/cap-guide",
        icon: <BookOpen className="w-4 h-4 text-slate-400" />,
        desc: "Step-by-step admission process",
      },
      {
        name: "Option Form Strategy",
        path: "/resources/option-form",
        icon: <Target className="w-4 h-4 text-blue-400" />,
        desc: "How to build the perfect preference list",
      },
      {
        name: "Document Checklist",
        path: "/resources/documents",
        icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
        desc: "Required documents for verification",
      },
    ],
  },
];

export function DesktopNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {MENU_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <div
            key={item.title}
            className="relative"
            onMouseEnter={() => setActiveMenu(item.title)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to={item.path}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all duration-300 relative z-10 ${
                isActive ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.icon}
              {item.title}
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-300 ${activeMenu === item.title ? "rotate-180 text-blue-400" : ""}`}
              />

              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg -z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            <AnimatePresence>
              {activeMenu === item.title && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] p-4 bg-slate-900/95 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 grid grid-cols-2 gap-2 z-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className="group flex flex-col p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 relative z-10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors group-hover:scale-110 duration-300">
                          {sub.icon}
                        </div>
                        <span className="font-semibold text-slate-200 group-hover:text-white text-sm flex items-center gap-1.5">
                          {sub.name}
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400 pl-9 transition-colors">
                        {sub.desc}
                      </span>
                    </Link>
                  ))}

                  {/* Bottom Promo CTA in Mega Menu */}
                  <div className="col-span-2 mt-2 pt-3 border-t border-white/5 flex items-center justify-between px-3">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Cutoff Data 2026
                    </span>
                    <Link
                      to={item.path}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      View All {item.title} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
