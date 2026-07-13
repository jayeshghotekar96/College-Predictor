import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      {/* Icon Area */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-500 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow duration-500">
          <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit className="w-5 h-5 text-emerald-400 relative z-10" />
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-400 to-emerald-400 text-transparent bg-clip-text">
            CAP Predictor
          </span>
          <span className="text-[10px] text-emerald-400 font-mono tracking-wider whitespace-nowrap ml-2">
            MHT-CET 2026
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide whitespace-nowrap">
          AI Powered Admission Predictor
        </span>
      </div>
    </Link>
  );
}
