import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Globe,
  Code,
  Briefcase,
  ArrowUp,
  ChevronRight,
  Database,
  Users,
  Search,
} from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <footer className="relative bg-[#0B1120] overflow-hidden pt-20 pb-10 border-t border-white/10 mt-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-60" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Footer Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-16"
        >
          {/* Brand & About (4 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 pr-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex flex-col mb-5 group inline-flex"
            >
              <span className="font-heading text-3xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-emerald-400 to-emerald-400 text-transparent bg-clip-text group-hover:opacity-80 transition-opacity">
                CAP Predictor
              </span>
              <span className="text-xs text-emerald-400 font-mono tracking-widest font-semibold uppercase mt-1">
                MHT-CET 2026
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 text-justify">
              Empowering engineering aspirants with AI-powered admission
              prediction, historical CAP cutoff analytics, intelligent college
              recommendations, and smart option form planning.
            </p>

            {/* Miniature Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> 384+ Colleges
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> 95+
                Reservation Categories
              </div>
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-400" /> 1,500+
                Branches
              </div>
            </div>
          </motion.div>

          {/* Links: Features (2 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white mb-5 uppercase tracking-wider text-[11px] opacity-80">
              Features
            </h3>
            <ul className="space-y-3">
              {[
                { name: "College Predictor", path: "/predict" },
                { name: "Reverse Predictor", path: "/predict?tab=reverse" },
                {
                  name: "Competitiveness Heatmap",
                  path: "/predict?tab=heatmap",
                },
                { name: "Cutoff Analytics", path: "/analytics" },
                { name: "Option Form Builder", path: "/dashboard" },
                { name: "College Explorer", path: "/colleges" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Links: Resources (2 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="font-heading font-bold text-white mb-5 uppercase tracking-wider text-[11px] opacity-80">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: "CAP Admission Guide", path: "/resources" },
                { name: "MHT-CET FAQs", path: "/resources" },
                { name: "Reservation Categories", path: "/resources" },
                { name: "Seat Matrix", path: "/resources" },
                { name: "Government Colleges", path: "/colleges?type=Govt" },
                { name: "Document Checklist", path: "/resources" },
                { name: "Latest Updates", path: "/resources" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={scrollToTop}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Developer & Newsletter (4 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <h3 className="font-heading font-bold text-white mb-5 uppercase tracking-wider text-[11px] opacity-80">
              Developer
            </h3>

            <div className="mb-6">
              <h4 className="font-heading font-bold text-slate-200 text-sm">
                Jayesh Ashok Ghotekar
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                B.E. Computer Engineering
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Loknete Gopinathji Munde Institute of Engineering Education &
                Research (LOGMIEER), Nashik
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 mt-4">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                  aria-label="GitHub"
                >
                  <Code className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-600/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                  aria-label="LinkedIn"
                >
                  <Briefcase className="w-4 h-4" />
                </a>
                <a
                  href="mailto:contact@example.com"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                  aria-label="Portfolio"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-heading font-bold text-white mb-2 uppercase tracking-wider text-[11px] opacity-80">
                Stay Updated
              </h3>
              <p className="text-slate-500 text-xs mb-3">
                Get notified about CAP rounds, cutoff updates, admission news,
                and new platform features.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail("");
                }}
                className="relative flex items-center"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 pr-28 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                  required
                />

                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10 mb-8">
          <div className="md:col-span-1">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                "React",
                "Node.js",
                "Express.js",
                "MongoDB",
                "Tailwind CSS",
                "TypeScript",
                "Vite",
                "Framer Motion",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 text-[10px] hover:bg-white/10 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">
              Platform Status
            </h4>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-400 font-mono">
                Version: <span className="text-slate-300">v1.0.0</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Dataset: <span className="text-slate-300">CAP 2023–2025</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                Status:{" "}
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                  All Systems Operational
                </span>
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-amber-500/70 text-[10px] font-bold uppercase tracking-wider mb-3">
              Disclaimer
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
              CAP Predictor is an independent educational platform developed to
              assist students during the Maharashtra CAP admission process. It
              is not affiliated with the State CET Cell, Government of
              Maharashtra, Directorate of Technical Education (DTE), or any
              engineering institution. Predictions are generated using
              historical admission data and analytical models. Please verify all
              admission-related information through the official CET Cell portal
              before making final decisions.
            </p>
          </div>
        </div>

        {/* Final Copyright & Links */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 text-[11px]">
              © 2026 Jayesh Ashok Ghotekar. All Rights Reserved.
            </p>
            <p className="text-slate-500 text-[11px]">
              Made with ❤️ in India for MHT-CET Aspirants.
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
            <Link to="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="#" className="hover:text-white transition-colors">
              Contact
            </Link>
            <span>•</span>
            <Link to="#" className="hover:text-white transition-colors">
              Feedback
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" /> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
