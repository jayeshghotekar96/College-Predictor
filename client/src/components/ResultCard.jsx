import React, { useState } from "react";
import { Sparkline } from "./TrendChart";
import { ProbabilityMeter } from "./ProbabilityMeter";
import { Link } from "react-router-dom";
import { Heart, FileText, Scale, Copy, Check } from "lucide-react";

export const ResultCard = React.memo(function ResultCard({
  result,
  category,
  userPercentile,
  isShortlisted,
  onToggleShortlist,
  isAddedToOption,
  onToggleOption,
  index,
}) {
  const [copiedChoice, setCopiedChoice] = useState(false);
  const { college, branch, chance, latestCutoff, roundTiming } = result;

  const chanceColors = {
    SAFE: {
      text: "text-safe",
      bg: "bg-safe/10",
      border: "border-safe/20",
      badge: "Safe Choices",
    },
    MODERATE: {
      text: "text-moderate",
      bg: "bg-moderate/10",
      border: "border-moderate/20",
      badge: "Moderate Target",
    },
    REACH: {
      text: "text-reach",
      bg: "bg-reach/10",
      border: "border-reach/20",
      badge: "Reach / Dream",
    },
    UNLIKELY: {
      text: "text-ink-muted",
      bg: "bg-paper-cool",
      border: "border-paper-cool",
      badge: "Unlikely",
    },
  };

  const currentColors = chanceColors[chance] || chanceColors.UNLIKELY;
  const animationDelay = `${(index % 12) * 50}ms`;

  return (
    <div
      className="ticket-enter ticket-stub mb-4 flex flex-col p-4 md:p-5 relative overflow-hidden"
      style={{ animationDelay }}
    >
      {/* 1. Header Layer */}
      <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-white/5 pb-2">
        <span
          className={`text-[10px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-xs ${currentColors.bg} ${currentColors.text} border border-current`}
        >
          {chance}
        </span>
        <span className="text-[10px] font-mono text-white/50 bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/10">
          Code: {college.collegeCode}
        </span>
        <span className="text-[10px] text-white/50 font-medium bg-white/5 px-1.5 py-0.5 rounded-sm">
          Type: {college.status}
        </span>
      </div>

      {/* 2. Identity Layer */}
      <div className="mb-4">
        <Link
          to={`/colleges/${college.collegeCode}`}
          className="group block"
          title={college.collegeName}
        >
          <h3 className="font-heading text-base md:text-lg font-extrabold text-white leading-snug line-clamp-2 group-hover:text-blue-400 group-hover:underline transition-colors flex items-start gap-2">
            <span className="shrink-0 text-xl mt-0.5">🏛</span>
            <span>
              {college.collegeName}
              <span className="inline-block opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1 duration-200 ml-1">
                ↗
              </span>
            </span>
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50 pl-7">
          <span className="shrink-0 text-sm">📍</span>
          <span className="font-semibold text-white/70">
            {college.district}
          </span>
        </div>
      </div>

      {/* 3. Branch Layer */}
      <div className="bg-black/20 rounded-lg p-3 border border-white/5 mb-4 pl-4 md:pl-5 border-l-2 border-l-blue-500/50">
        <p className="text-sm md:text-[15px] font-bold text-white/90 mb-2">
          {branch.courseName}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>Choice Code:</span>
          <span className="group/choice relative inline-flex items-center gap-1">
            <span className="mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/20 shadow-xs">
              {branch.choiceCode}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(branch.choiceCode);
                setCopiedChoice(true);
                setTimeout(() => setCopiedChoice(false), 1500);
              }}
              className="p-1 rounded-sm bg-white/10 hover:bg-white/20 text-white/50 hover:text-white cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/choice:opacity-100 border border-white/20 shadow-xs"
              title="Copy Choice Code"
            >
              {copiedChoice ? (
                <Check className="w-3.5 h-3.5 text-safe" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </span>
        </div>
      </div>

      {/* 4. Metrics Layer */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-white/10 bg-white/5 -mx-4 md:-mx-5 px-4 md:px-5">
        {/* Trend */}
        <div className="flex flex-col items-start w-[80px]">
          <span className="text-[9px] uppercase tracking-wider font-heading font-bold text-white/50 mb-1 flex items-center gap-1">
            📈 3-Yr Trend
          </span>
          <Sparkline
            cutoffs={branch.cutoffs}
            category={result.appliedCategory || category}
          />
          {result.appliedCategory && result.appliedCategory !== category && (
            <span
              className="text-[8px] text-white/40 mt-0.5"
              title="Equivalent Category matched"
            >
              ({result.appliedCategory})
            </span>
          )}
        </div>

        {/* Probability & Cutoff */}
        <div className="flex items-center justify-center flex-1 border-x border-white/10 px-2 md:px-4 gap-4 md:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider font-heading font-bold text-white/50 mb-1 flex items-center gap-1">
              🎯 Chance
            </span>
            <ProbabilityMeter
              userPercentile={userPercentile}
              cutoff={latestCutoff}
              size={36}
              strokeWidth={4}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-wider font-heading font-bold text-white/50 mb-2">
              Last Cutoff
            </span>
            <span className="text-lg font-extrabold text-white leading-none">
              {latestCutoff.toFixed(2)}
              <span className="text-xs font-normal text-white/50">%</span>
            </span>
          </div>
        </div>

        {/* Best Round */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-wider font-heading font-bold text-white/50 mb-1 flex items-center gap-1">
            ⭐ Best Round
          </span>
          <span className="mono text-sm font-bold bg-white/10 border border-white/20 px-2 py-1 rounded-sm text-white/80">
            R{roundTiming}
          </span>
        </div>
      </div>

      {/* 5. Action Buttons Layer */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-all border ${
            isShortlisted
              ? "bg-reach/10 text-reach border-reach/30 hover:bg-reach/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${isShortlisted ? "fill-reach" : ""}`}
          />
          {isShortlisted ? "Saved" : "Save"}
        </button>

        <Link
          to={`/colleges/${college.collegeCode}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-md text-xs font-semibold transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          Details
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleOption();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold transition-all border ${
            isAddedToOption
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Scale
            className={`w-3.5 h-3.5 ${isAddedToOption ? "fill-amber-500/30" : ""}`}
          />
          {isAddedToOption ? "Compare" : "Compare"}
        </button>
      </div>
    </div>
  );
});
