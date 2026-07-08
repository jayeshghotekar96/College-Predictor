import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  BarChart3,
  ListOrdered,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="flex-1 w-full bg-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            variants={fadeIn}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Maharashtra CAP 2026 Admissions
            </div>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.1 }}
            variants={fadeIn}
            className="text-5xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
          >
            Predict Your Dream Engineering College
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={fadeIn}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            AI-powered prediction using previous cutoff trends, category
            analysis, and intelligent admission algorithms for MHT-CET students.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.3 }}
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/predict"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
            >
              Start Prediction
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/colleges"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              Explore Colleges
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {[
              { label: "Engineering Colleges", value: "384+" },
              { label: "Reservation Categories", value: "95+" },
              { label: "Historical Data", value: "3 Years" },
              { label: "Predictions Generated", value: "10k+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center px-4"
              >
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              A complete toolkit designed to eliminate guesswork and optimize
              your option form for the best possible allotment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-8 h-8 text-blue-400" />,
                title: "College Predictor",
                desc: "Instantly view Safe, Moderate, and Reach options based on your exact percentile and category.",
              },
              {
                icon: <Search className="w-8 h-8 text-emerald-400" />,
                title: "Reverse Predictor",
                desc: "Select a target college and branch to see exactly what percentile is required for admission.",
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
                title: "Cutoff Analytics",
                desc: "Explore interactive heatmaps and trend lines comparing 2023, 2024, and 2025 cutoffs.",
              },
              {
                icon: <GraduationCap className="w-8 h-8 text-purple-400" />,
                title: "Branch Comparison",
                desc: "Compare IT, CS, and AI/DS branches side-by-side to understand shifting industry demands.",
              },
              {
                icon: <ListOrdered className="w-8 h-8 text-amber-400" />,
                title: "Option Form Builder",
                desc: "Drag and drop your shortlisted colleges to build the perfect preference list before CAP round 1.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
