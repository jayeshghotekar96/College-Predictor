import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between relative z-10">
            <div className="flex-1 flex items-center justify-center gap-3 text-sm font-medium">
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                New
              </span>
              <span>
                🚀 CAP Round 1 Prediction Engine is Live. 2025 Official Cutoff
                Dataset Updated!
              </span>
              <Link
                to="/predict"
                className="hidden md:flex items-center gap-1 text-white hover:text-cyan-200 underline underline-offset-4 decoration-white/40 transition-colors font-bold"
              >
                Explore Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-white/80 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
