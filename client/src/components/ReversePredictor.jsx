import { useState, useMemo, useEffect } from "react";
import { predictionsAPI } from "../services/api";
import { TrendChart } from "./TrendChart";

export function ReversePredictor({ colleges, categories, defaultCategory }) {
  const [selectedCollegeCode, setSelectedCollegeCode] = useState("");
  const [selectedChoiceCode, setSelectedChoiceCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const [collegeSearch, setCollegeSearch] = useState("");

  // 1. Filter colleges by name/search input
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return colleges;
    const term = collegeSearch.toLowerCase();
    return colleges.filter(
      (c) =>
        c.collegeName.toLowerCase().includes(term) ||
        c.collegeCode.toString().includes(term),
    );
  }, [colleges, collegeSearch]);

  const selectedCollege = useMemo(() => {
    return colleges.find((c) => c.collegeCode === selectedCollegeCode);
  }, [colleges, selectedCollegeCode]);

  const selectedBranch = useMemo(() => {
    if (!selectedCollege) return null;
    return (
      selectedCollege.branches.find(
        (b) => b.choiceCode === selectedChoiceCode,
      ) || null
    );
  }, [selectedCollege, selectedChoiceCode]);

  // Determine available branches for the selected college
  const branchesList = selectedCollege ? selectedCollege.branches : [];

  const [reverseResult, setReverseResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    if (!selectedCollegeCode || !selectedChoiceCode || !selectedCategory) {
      setReverseResult(null);
      return;
    }

    let isMounted = true;
    setIsPredicting(true);

    predictionsAPI.reverse({
      collegeCode: selectedCollegeCode,
      choiceCode: selectedChoiceCode,
      category: selectedCategory,
    })
      .then((res) => {
        if (isMounted) {
          setReverseResult({
            prediction: res.data.prediction,
            cutoffs: res.data.branch.cutoffs,
          });
          setIsPredicting(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Reverse prediction error:", err);
          setReverseResult(null);
          setIsPredicting(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCollegeCode, selectedChoiceCode, selectedCategory]);

  const confidenceColors = {
    high: "bg-safe/10 text-safe border-safe/20",
    medium: "bg-moderate/10 text-moderate border-moderate/20",
    low: "bg-reach/10 text-reach border-reach/20",
  };

  const handleCollegeSelect = (code) => {
    setSelectedCollegeCode(code);
    setSelectedChoiceCode(""); // reset branch selection
    const coll = colleges.find((c) => c.collegeCode === code);
    setCollegeSearch(coll ? coll.collegeName : "");
  };

  return (
    <div className="glass-panel rounded-md p-5 md:p-6 mb-6">
      <div className="mb-5">
        <h3 className="font-heading text-sm font-bold text-white">
          Reverse Cutoff Predictor
        </h3>
        <p className="text-xs text-white/50 mt-1">
          Have a target college and branch in mind? Select them below to
          estimate the required CET percentile needed to secure a seat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-6">
        {/* College Search & Selector */}
        <div className="relative">
          <label className="font-heading text-xs font-bold text-white uppercase tracking-wider block mb-2">
            Target College
          </label>
          <input
            type="text"
            placeholder="Search college by name or code..."
            value={collegeSearch}
            onChange={(e) => {
              setCollegeSearch(e.target.value);
              if (selectedCollegeCode) setSelectedCollegeCode("");
            }}
            className="w-full glass-input px-3 py-2 rounded-sm text-xs font-medium focus:outline-none"
          />

          {/* Dropdown Suggestions List */}
          {!selectedCollegeCode && collegeSearch.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-black/80 backdrop-blur-md border border-white/20 rounded-sm shadow-lg z-20 p-1 flex flex-col gap-1">
              {filteredColleges.slice(0, 15).map((c) => (
                <button
                  key={c.collegeCode}
                  onClick={() => handleCollegeSelect(c.collegeCode)}
                  className="flex items-center text-left w-full px-3 py-2 hover:bg-white/10 rounded-sm cursor-pointer transition-colors"
                >
                  <span className="shrink-0 mono text-[10px] font-bold text-white/50 bg-white/10 border border-white/10 px-1.5 py-0.5 rounded-sm mr-2">
                    {c.collegeCode}
                  </span>
                  <span className="text-xs font-medium text-white truncate">
                    {c.collegeName}
                  </span>
                </button>
              ))}
              {filteredColleges.length === 0 && (
                <div className="px-3 py-2 text-xs text-white/50">
                  No colleges match your search
                </div>
              )}
            </div>
          )}
        </div>

        {/* Branch Selector */}
        <div>
          <label className="font-heading text-xs font-bold text-white uppercase tracking-wider block mb-2">
            Course Branch
          </label>
          <select
            value={selectedChoiceCode}
            onChange={(e) => setSelectedChoiceCode(e.target.value)}
            disabled={!selectedCollegeCode}
            className="w-full glass-input disabled:opacity-50 px-3 py-2 rounded-sm text-xs font-medium cursor-pointer [&>option]:bg-black [&>option]:text-white focus:outline-none"
          >
            <option value="">-- Choose Branch --</option>
            {branchesList.map((b) => (
              <option key={b.choiceCode} value={b.choiceCode}>
                {b.courseName} ({b.choiceCode})
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="font-heading text-xs font-bold text-white uppercase tracking-wider block mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-sm text-xs font-medium cursor-pointer [&>option]:bg-black [&>option]:text-white focus:outline-none"
          >
            {Object.entries(categories)
              .filter(([code]) => !code.endsWith("H") && !code.endsWith("O"))
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([code, info]) => {
                const parts = info.label.split(",").slice(0, 2);
                const cleanLabel = parts
                  .join(",")
                  .replace(/\s*\(General\)/, "");
                return (
                  <option key={code} value={code}>
                    {code.replace(/S$/, "")} — {cleanLabel}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Results View */}
      {selectedCollege && selectedBranch && (
        <div className="pt-5 border-t border-white/10 animate-fadeIn">
          {isPredicting ? (
            <div className="text-center py-8 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs">Calculating...</span>
            </div>
          ) : reverseResult?.prediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Ticket-Stub Style Prediction Card */}
              <div className="lg:col-span-1 ticket-stub glass-panel border border-white/20 p-5 pl-7 relative">
                <div className="ticket-tab ticket-tab-safe bg-amber" />

                <span className="text-[10px] font-heading font-bold text-white/50 uppercase tracking-wider block mb-2">
                  Estimated Admission Threshold
                </span>

                <div className="flex flex-col mb-4">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">
                    Recommended Score
                  </span>
                  <div className="mono text-4xl font-extrabold text-white flex items-baseline">
                    {reverseResult.prediction.requiredPercentile.toFixed(2)}
                    <span className="text-sm font-normal text-white/50 ml-1">
                      %ile
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">
                      Historical Data Count:
                    </span>
                    <span className="font-semibold text-white/80">
                      {
                        reverseResult.cutoffs.filter(
                          (c) => c.category === selectedCategory,
                        ).length
                      }{" "}
                      records
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Confidence Level:</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded-sm ${
                        confidenceColors[reverseResult.prediction.confidence]
                      }`}
                    >
                      {reverseResult.prediction.confidence}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Round Timing:</span>
                    <span className="mono font-semibold bg-white/20 px-2 py-0.5 rounded-sm text-white">
                      Round {reverseResult.prediction.roundLikely}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-white/50 leading-relaxed">
                  * Estimated percentile represents a score that yields a{" "}
                  <strong>SAFE</strong> placement prediction based on
                  recency-weighted cutoff trend movements.
                </div>
              </div>

              {/* Historical Trend Chart */}
              <div className="lg:col-span-2">
                <TrendChart
                  cutoffs={reverseResult.cutoffs}
                  category={selectedCategory}
                />
              </div>
            </div>
          ) : (
            <div className="bg-reach/5 p-4 rounded-sm border border-reach/20 text-center text-reach text-xs">
              ⚠️ No historical records found for category{" "}
              <strong>{selectedCategory}</strong> at this specific branch. Try
              selecting a different category or course branch.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
