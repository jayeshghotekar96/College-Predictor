import React, { useState, useMemo, useDeferredValue } from "react";
import { useData } from "../lib/DataContext";
import { useUrlState } from "../hooks/useUrlState";
import { useShortlist } from "../hooks/useShortlist";
import { predictAll } from "../lib/prediction";
import { SearchForm } from "../components/SearchForm";
import { ResultCard } from "../components/ResultCard";
import { ShortlistPanel } from "../components/ShortlistPanel";
import { ReversePredictor } from "../components/ReversePredictor";
import { CompetitivenessHeatmap } from "../components/CompetitivenessHeatmap";
import { ResultTable } from "../components/ResultTable";
import { OptionFormPanel } from "../components/OptionFormPanel";
import { useOptionForm } from "../hooks/useOptionForm";

const DEFAULT_FILTERS = {
  percentile: 90.0,
  category: "GOPENS",
  level: undefined,
  gender: undefined,
  branches: undefined,
  districts: undefined,
};

export function PredictorPage() {
  const { data, loading, error, retry } = useData();
  const [activeTab, setActiveTab] = useState("predictor");
  const [copiedLink, setCopiedLink] = useState(false);
  const [groupBy, setGroupBy] = useState("chance");

  // Custom Display Mode, Search, and Sort state variables
  const [displayMode, setDisplayMode] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [sortMode, setSortMode] = useState("percentile");

  // Load URL synced state or fallbacks
  const [filters, setFilters] = useUrlState(DEFAULT_FILTERS);

  // Shortlist management hook
  const { shortlist, toggle, isShortlisted, remove, exportAsText } =
    useShortlist();

  // Option Form builder hook
  const {
    optionForm,
    addOption,
    removeOption,
    moveOption,
    setRank,
    hasOption,
    setOptionForm,
    exportOptionFormText,
  } = useOptionForm();

  // Extract all unique branches and districts for filter lists
  const allBranches = useMemo(() => {
    if (!data) return [];
    const set = new Set();
    data.colleges.forEach((c) => {
      c.branches.forEach((b) => {
        if (b.courseName) set.add(b.courseName);
      });
    });
    return Array.from(set).sort();
  }, [data]);

  const allDistricts = useMemo(() => {
    if (!data) return [];
    const set = new Set();
    data.colleges.forEach((c) => {
      if (c.district && c.district !== "Unknown") {
        set.add(c.district);
      }
    });
    return Array.from(set).sort();
  }, [data]);

  // Run the core prediction engine
  const predictionResults = useMemo(() => {
    if (!data) return { safe: [], moderate: [], reach: [] };
    return predictAll(filters.percentile, filters.category, data.colleges, {
      branches: filters.branches,
      districts: filters.districts,
    });
  }, [data, filters]);

  // Apply search query match and sorting selection using DEFERRED search term
  const filteredAndSortedResults = useMemo(() => {
    const raw = predictionResults;
    const searchLower = deferredSearchTerm.trim().toLowerCase();

    const filterFn = (res) => {
      if (!searchLower) return true;
      return (
        res.college.collegeName.toLowerCase().includes(searchLower) ||
        res.college.collegeCode.toString().includes(searchLower) ||
        res.branch.courseName.toLowerCase().includes(searchLower) ||
        res.branch.choiceCode.includes(searchLower)
      );
    };

    const sortFn = (a, b) => {
      if (sortMode === "percentile") {
        return b.latestCutoff - a.latestCutoff;
      }
      if (sortMode === "alphabetical") {
        return a.college.collegeName.localeCompare(b.college.collegeName);
      }
      if (sortMode === "district") {
        return a.college.district.localeCompare(b.college.district);
      }
      return 0;
    };

    return {
      safe: raw.safe.filter(filterFn).sort(sortFn),
      moderate: raw.moderate.filter(filterFn).sort(sortFn),
      reach: raw.reach.filter(filterFn).sort(sortFn),
    };
  }, [predictionResults, deferredSearchTerm, sortMode]);

  // Group results by district
  const resultsByDistrict = useMemo(() => {
    const combined = [
      ...filteredAndSortedResults.safe,
      ...filteredAndSortedResults.moderate,
      ...filteredAndSortedResults.reach,
    ];
    const groups = {};
    combined.forEach((res) => {
      const dist = res.college.district;
      if (!groups[dist]) groups[dist] = [];
      groups[dist].push(res);
    });
    const sortedKeys = Object.keys(groups).sort();
    return sortedKeys.map((key) => ({
      district: key,
      results: groups[key],
    }));
  }, [filteredAndSortedResults]);

  const combinedActiveResults = useMemo(() => {
    return [
      ...filteredAndSortedResults.safe,
      ...filteredAndSortedResults.moderate,
      ...filteredAndSortedResults.reach,
    ];
  }, [filteredAndSortedResults]);

  const handleHeatmapCellClick = (district, branch) => {
    setFilters({
      ...filters,
      districts: [district],
      branches: [branch],
    });
    setActiveTab("predictor");
    // Smooth scroll to results
    setTimeout(() => {
      document
        .getElementById("results-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-heading text-slate-200 text-lg font-bold">
            Loading Admission Cutoffs...
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Parsing historical rounds (2023–2025)
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md p-8 bg-slate-800/50 border border-red-500/20 rounded-xl shadow-lg backdrop-blur-md">
          <p className="font-heading text-red-400 text-xl font-bold mb-2">
            Failed to load data
          </p>
          <p className="text-slate-400 text-xs mb-5 leading-normal">{error}</p>
          <button
            onClick={retry}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalResultsCount =
    filteredAndSortedResults.safe.length +
    filteredAndSortedResults.moderate.length +
    filteredAndSortedResults.reach.length;

  const handleToggleOption = (
    collegeCode,
    choiceCode,
    collegeName,
    courseName,
    district,
  ) => {
    if (hasOption(choiceCode)) {
      removeOption(choiceCode);
    } else {
      addOption(collegeCode, choiceCode, collegeName, courseName, district);
    }
  };

  return (
    <div className="w-full relative flex-1 flex flex-col">
      {/* Tab Navigation Menu */}
      <nav className="glass-panel px-6 relative z-10 border-b border-white/10 shadow-xs mb-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          {[
            { id: "predictor", label: "Admission Predictor", icon: "🎯" },
            { id: "reverse", label: "Reverse Predictor", icon: "🔍" },
            { id: "heatmap", label: "Competitiveness Heatmap", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-heading text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-emerald-400 text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Workspace Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 w-full pb-20">
        {/* TAB 1: Core Search & Predictor */}
        {activeTab === "predictor" && (
          <div>
            <SearchForm
              filters={filters}
              onFilterChange={setFilters}
              categories={data.categories}
              allBranches={allBranches}
              allDistricts={allDistricts}
            />

            {/* Unified Search, Sort, and View Toggle Bar */}
            <div className="glass-panel rounded-xl border border-white/10 p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search by College Name, Code, Branch, or Choice Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-lg text-xs font-semibold outline-none"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer font-semibold text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Sorting Select */}
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sort:
                  </span>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="glass-input px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer outline-none"
                  >
                    <option
                      value="percentile"
                      className="bg-slate-900 text-slate-100"
                    >
                      Closest Percentile Match
                    </option>
                    <option
                      value="alphabetical"
                      className="bg-slate-900 text-slate-100"
                    >
                      Alphabetical (College)
                    </option>
                    <option
                      value="district"
                      className="bg-slate-900 text-slate-100"
                    >
                      By District Name
                    </option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-white/10 rounded-lg overflow-hidden p-1 bg-black/20">
                  <button
                    onClick={() => setDisplayMode("card")}
                    className={`text-[10px] uppercase tracking-wider font-heading font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      displayMode === "card"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🎴 Cards
                  </button>
                  <button
                    onClick={() => setDisplayMode("table")}
                    className={`text-[10px] uppercase tracking-wider font-heading font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      displayMode === "table"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📊 Table
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid Dashboard */}
            <div id="results-section" className="scroll-mt-20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <span>Admission Predictions</span>
                    <span className="mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      {totalResultsCount} Matches
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Estimated allocation likelihoods based on a target score of{" "}
                    <span className="mono font-semibold text-white">
                      {filters.percentile}%
                    </span>
                    .
                  </p>
                </div>

                {/* Grouping Toggle (only visible in card view since table view is a single consolidated listing) */}
                {totalResultsCount > 0 && displayMode === "card" && (
                  <div className="flex border border-white/10 rounded-lg overflow-hidden p-1 bg-black/20">
                    <button
                      onClick={() => setGroupBy("chance")}
                      className={`text-[10px] uppercase tracking-wider font-heading font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        groupBy === "chance"
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      By Chance Tier
                    </button>
                    <button
                      onClick={() => setGroupBy("district")}
                      className={`text-[10px] uppercase tracking-wider font-heading font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        groupBy === "district"
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      By District
                    </button>
                  </div>
                )}
              </div>

              {totalResultsCount === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center text-slate-400">
                  <p className="font-heading text-sm font-semibold text-slate-300">
                    No cutoff predictions found
                  </p>
                  <p className="text-xs mt-1 max-w-md mx-auto">
                    Try raising your percentile score slider, switching
                    categories, or removing advanced filters to explore more
                    options.
                  </p>
                </div>
              ) : displayMode === "table" ? (
                <div className="animate-fadeIn">
                  <ResultTable
                    results={combinedActiveResults}
                    category={filters.category}
                    isShortlisted={(collegeCode, choiceCode) =>
                      isShortlisted(collegeCode, choiceCode)
                    }
                    onToggleShortlist={(
                      collegeCode,
                      choiceCode,
                      collegeName,
                      courseName,
                      district,
                    ) =>
                      toggle(
                        collegeCode,
                        choiceCode,
                        collegeName,
                        courseName,
                        district,
                      )
                    }
                    isAddedToOption={hasOption}
                    onToggleOption={handleToggleOption}
                  />
                </div>
              ) : groupBy === "chance" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 items-start animate-fadeIn">
                  {/* Column 1: SAFE (Green) */}
                  <div className="space-y-4">
                    <div className="bg-emerald-500/20 text-emerald-300 px-4 py-3 rounded-lg flex items-center justify-between border border-emerald-500/30 shadow-xs">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        🟢 Safe Choices
                      </h3>
                      <span className="mono text-xs font-bold bg-emerald-500/30 px-2 py-0.5 rounded-md">
                        {filteredAndSortedResults.safe.length}
                      </span>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto pr-1">
                      {filteredAndSortedResults.safe.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-black/20 p-4 text-center rounded-lg border border-dashed border-white/10">
                          No safe matches. Try moderate choices.
                        </p>
                      ) : (
                        filteredAndSortedResults.safe.map((res, i) => (
                          <ResultCard
                            key={`${res.college.collegeCode}-${res.branch.choiceCode}`}
                            result={res}
                            category={filters.category}
                            userPercentile={filters.percentile}
                            isShortlisted={isShortlisted(
                              res.college.collegeCode,
                              res.branch.choiceCode,
                            )}
                            onToggleShortlist={() =>
                              toggle(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            isAddedToOption={hasOption(res.branch.choiceCode)}
                            onToggleOption={() =>
                              handleToggleOption(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            index={i}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 2: MODERATE (Amber) */}
                  <div className="space-y-4">
                    <div className="bg-amber-500/20 text-amber-300 px-4 py-3 rounded-lg flex items-center justify-between border border-amber-500/30 shadow-xs">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        🟡 Moderate Targets
                      </h3>
                      <span className="mono text-xs font-bold bg-amber-500/30 px-2 py-0.5 rounded-md">
                        {filteredAndSortedResults.moderate.length}
                      </span>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto pr-1">
                      {filteredAndSortedResults.moderate.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-black/20 p-4 text-center rounded-lg border border-dashed border-white/10">
                          No moderate matches. Explore reach boundaries.
                        </p>
                      ) : (
                        filteredAndSortedResults.moderate.map((res, i) => (
                          <ResultCard
                            key={`${res.college.collegeCode}-${res.branch.choiceCode}`}
                            result={res}
                            category={filters.category}
                            userPercentile={filters.percentile}
                            isShortlisted={isShortlisted(
                              res.college.collegeCode,
                              res.branch.choiceCode,
                            )}
                            onToggleShortlist={() =>
                              toggle(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            isAddedToOption={hasOption(res.branch.choiceCode)}
                            onToggleOption={() =>
                              handleToggleOption(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            index={i}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Column 3: REACH (Red) */}
                  <div className="space-y-4">
                    <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg flex items-center justify-between border border-red-500/30 shadow-xs">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        🔴 Reach / Dream
                      </h3>
                      <span className="mono text-xs font-bold bg-red-500/30 px-2 py-0.5 rounded-md">
                        {filteredAndSortedResults.reach.length}
                      </span>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto pr-1">
                      {filteredAndSortedResults.reach.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-black/20 p-4 text-center rounded-lg border border-dashed border-white/10">
                          No reach candidates found.
                        </p>
                      ) : (
                        filteredAndSortedResults.reach.map((res, i) => (
                          <ResultCard
                            key={`${res.college.collegeCode}-${res.branch.choiceCode}`}
                            result={res}
                            category={filters.category}
                            userPercentile={filters.percentile}
                            isShortlisted={isShortlisted(
                              res.college.collegeCode,
                              res.branch.choiceCode,
                            )}
                            onToggleShortlist={() =>
                              toggle(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            isAddedToOption={hasOption(res.branch.choiceCode)}
                            onToggleOption={() =>
                              handleToggleOption(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            index={i}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Group by District View */
                <div className="space-y-8 animate-fadeIn">
                  {resultsByDistrict.map((group) => (
                    <div
                      key={group.district}
                      className="glass-panel rounded-xl p-5 shadow-xs"
                    >
                      <h3 className="font-heading text-sm font-bold text-white mb-4 pb-2 border-b border-white/10 flex justify-between items-center">
                        <span>📍 {group.district}</span>
                        <span className="mono text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full border border-white/20 text-white/80">
                          {group.results.length} Seats
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 min-[1400px]:grid-cols-3 min-[1600px]:grid-cols-4 gap-4">
                        {group.results.map((res, i) => (
                          <ResultCard
                            key={`${res.college.collegeCode}-${res.branch.choiceCode}`}
                            result={res}
                            category={filters.category}
                            userPercentile={filters.percentile}
                            isShortlisted={isShortlisted(
                              res.college.collegeCode,
                              res.branch.choiceCode,
                            )}
                            onToggleShortlist={() =>
                              toggle(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            isAddedToOption={hasOption(res.branch.choiceCode)}
                            onToggleOption={() =>
                              handleToggleOption(
                                res.college.collegeCode,
                                res.branch.choiceCode,
                                res.college.collegeName,
                                res.branch.courseName,
                                res.college.district,
                              )
                            }
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Target search (Reverse Predictor) */}
        {activeTab === "reverse" && (
          <ReversePredictor
            colleges={data.colleges}
            categories={data.categories}
            defaultCategory={filters.category}
          />
        )}

        {/* TAB 3: Heatmap Table view */}
        {activeTab === "heatmap" && (
          <CompetitivenessHeatmap
            colleges={data.colleges}
            category={filters.category}
            allBranches={allBranches}
            allDistricts={allDistricts}
            onCellClick={handleHeatmapCellClick}
          />
        )}
      </div>

      {/* Persistent Shortlist Float Panel Drawer */}
      <ShortlistPanel
        shortlist={shortlist}
        onRemove={remove}
        exportAsText={exportAsText}
      />

      {/* Build My Option Form Drawer */}
      <OptionFormPanel
        optionForm={optionForm}
        userPercentile={filters.percentile}
        onRemove={removeOption}
        onMove={moveOption}
        onRankChange={setRank}
        onReorderList={setOptionForm}
        exportAsText={exportOptionFormText}
      />
    </div>
  );
}
