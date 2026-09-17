import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

export function SearchForm({
  filters,
  onFilterChange,
  onSearch,
  isPredicting = false,
  categories,
  allBranches,
  allDistricts,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  // Local state to prevent expensive live queries during typing / slider moving
  const [localFilters, setLocalFilters] = useState(filters);
  const [localPercentile, setLocalPercentile] = useState(filters.percentile);

  // Sync local state if external filters change
  useEffect(() => {
    setLocalFilters(filters);
    setLocalPercentile(filters.percentile);
  }, [filters]);

  // Handle inputs
  const handlePercentileChange = (val) => {
    const clamped = Math.min(100, Math.max(0, val));
    setLocalPercentile(clamped);
    setLocalFilters((prev) => ({ ...prev, percentile: clamped }));
  };

  const handleCategoryChange = (val) => {
    setLocalFilters((prev) => ({ ...prev, category: val }));
  };

  const handleLevelChange = (val) => {
    setLocalFilters((prev) => ({
      ...prev,
      level: val === "ALL" ? undefined : val,
    }));
  };

  const handleGenderChange = (val) => {
    setLocalFilters((prev) => ({
      ...prev,
      gender: val === "ALL" ? undefined : val,
    }));
  };

  const toggleBranch = (branch) => {
    const current = localFilters.branches || [];
    const next = current.includes(branch)
      ? current.filter((b) => b !== branch)
      : [...current, branch];
    setLocalFilters((prev) => ({
      ...prev,
      branches: next.length > 0 ? next : undefined,
    }));
  };

  const toggleDistrict = (district) => {
    const current = localFilters.districts || [];
    const next = current.includes(district)
      ? current.filter((d) => d !== district)
      : [...current, district];
    setLocalFilters((prev) => ({
      ...prev,
      districts: next.length > 0 ? next : undefined,
    }));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const clamped = Math.min(100, Math.max(0, parseFloat(localPercentile) || 0));
    const updated = {
      ...localFilters,
      percentile: clamped,
    };
    onFilterChange?.(updated);
    onSearch?.(updated);
  };

  const clearAllFilters = () => {
    const reset = {
      percentile: localPercentile,
      category: localFilters.category,
      level: undefined,
      gender: undefined,
      branches: undefined,
      districts: undefined,
    };
    setLocalFilters(reset);
    setBranchSearch("");
    setDistrictSearch("");
    onFilterChange?.(reset);
    onSearch?.(reset);
  };

  // Sort and filter branches/districts based on search inputs (memoized)
  const filteredBranches = useMemo(() => {
    const q = branchSearch.toLowerCase();
    return allBranches
      .filter((b) => b.toLowerCase().includes(q))
      .slice(0, 100);
  }, [allBranches, branchSearch]);

  const filteredDistricts = useMemo(() => {
    const q = districtSearch.toLowerCase();
    return allDistricts
      .filter((d) => d.toLowerCase().includes(q))
      .slice(0, 100);
  }, [allDistricts, districtSearch]);

  return (
    <div className="glass-panel rounded-xl p-5 md:p-6 mb-6">
      {/* Primary Row: Percentile, Category & Search College Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end">
        {/* Percentile Input */}
        <div className="lg:col-span-5">
          <div className="flex justify-between items-center mb-2">
            <label className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              My CET Percentile
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={localPercentile}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setLocalPercentile(val);
                }}
                onBlur={() => handlePercentileChange(localPercentile)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                className="mono font-semibold text-sm w-20 text-right glass-input px-2 py-1 rounded-sm"
              />
              <span className="text-xs text-white/50">%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="0.05"
              value={localPercentile}
              onChange={(e) => setLocalPercentile(parseFloat(e.target.value))}
              onMouseUp={() => handlePercentileChange(localPercentile)}
              onTouchEnd={() => handlePercentileChange(localPercentile)}
              style={{
                background: `linear-gradient(to right, var(--color-amber) 0%, var(--color-amber) ${localPercentile}%, rgba(255,255,255,0.1) ${localPercentile}%, rgba(255,255,255,0.1) 100%)`,
              }}
              className="flex-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div className="lg:col-span-4">
          <label className="font-heading text-xs font-bold text-white uppercase tracking-wider block mb-2">
            CAP Reservation Category
          </label>
          <select
            value={localFilters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-sm text-xs font-medium cursor-pointer"
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
                  <option key={code} value={code} className="text-slate-900">
                    {code.replace(/S$/, "")} — {cleanLabel}
                  </option>
                );
              })}
          </select>
        </div>

        {/* Search College Button */}
        <div className="lg:col-span-3">
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isPredicting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPredicting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-emerald-100" />
                <span>Search College</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filter Collapsible Panel */}
      <div className="mt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-heading font-semibold text-white/50 hover:text-amber transition-colors cursor-pointer"
        >
          <span>{showAdvanced ? "Hide" : "Show"} Advanced Filters</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
            {/* Level Scope Selection */}
            <div>
              <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-2">
                University Level Scope
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "All Levels", value: "ALL" },
                  { label: "State Level (S)", value: "S" },
                  { label: "Home University (H)", value: "H" },
                  { label: "Other Than Home (O)", value: "O" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber"
                  >
                    <input
                      type="radio"
                      name="levelScope"
                      checked={
                        opt.value === "ALL"
                          ? !localFilters.level
                          : localFilters.level === opt.value
                      }
                      onChange={() => handleLevelChange(opt.value)}
                      className="accent-amber"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Scope Selection */}
            <div>
              <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-2">
                Seat Type / Gender
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "All Seats", value: "ALL" },
                  { label: "General Seats (G)", value: "G" },
                  { label: "Ladies Only (L)", value: "L" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber"
                  >
                    <input
                      type="radio"
                      name="genderScope"
                      checked={
                        opt.value === "ALL"
                          ? !localFilters.gender
                          : localFilters.gender === opt.value
                      }
                      onChange={() => handleGenderChange(opt.value)}
                      className="accent-amber"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* District Filter Multi-select with Search */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  Districts ({localFilters.districts?.length || "All"})
                </label>
                {localFilters.districts && localFilters.districts.length > 0 && (
                  <button
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, districts: undefined }))
                    }
                    className="text-[10px] text-amber hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full glass-input px-2.5 py-1 rounded-sm text-xs mb-2"
              />
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-black/20 p-2 rounded-sm border border-white/5">
                {filteredDistricts.map((dist) => (
                  <label
                    key={dist}
                    className="flex items-center gap-2 text-xs text-white/70 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={(localFilters.districts || []).includes(dist)}
                      onChange={() => toggleDistrict(dist)}
                      className="rounded-xs accent-amber"
                    />
                    <span className="truncate">{dist}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Branch Filter Multi-select with Search */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  Branches ({localFilters.branches?.length || "All"})
                </label>
                {localFilters.branches && localFilters.branches.length > 0 && (
                  <button
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, branches: undefined }))
                    }
                    className="text-[10px] text-amber hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Search branch..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="w-full glass-input px-2.5 py-1 rounded-sm text-xs mb-2"
              />
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-black/20 p-2 rounded-sm border border-white/5">
                {filteredBranches.map((branch) => (
                  <label
                    key={branch}
                    className="flex items-center gap-2 text-xs text-white/70 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={(localFilters.branches || []).includes(branch)}
                      onChange={() => toggleBranch(branch)}
                      className="rounded-xs accent-amber"
                    />
                    <span className="truncate" title={branch}>
                      {branch}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filters chips and Advanced Search Trigger */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 mt-4 items-center pt-3 border-t border-white/5">
          {(localFilters.level ||
            localFilters.gender ||
            (localFilters.branches && localFilters.branches.length > 0) ||
            (localFilters.districts && localFilters.districts.length > 0)) && (
            <>
              <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">
                Selected:
              </span>
              {localFilters.level && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Level: {localFilters.level}
                </span>
              )}
              {localFilters.gender && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Gender: {localFilters.gender}
                </span>
              )}
              {localFilters.districts && localFilters.districts.length > 0 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Districts ({localFilters.districts.length})
                </span>
              )}
              {localFilters.branches && localFilters.branches.length > 0 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Branches ({localFilters.branches.length})
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-semibold text-reach hover:underline cursor-pointer ml-auto"
              >
                Clear Advanced Filters
              </button>
            </>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={isPredicting}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-heading font-bold text-[11px] uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply & Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
