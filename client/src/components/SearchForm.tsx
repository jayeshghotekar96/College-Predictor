import { useState } from 'react';
import type { SearchFilters, DecodedCategory } from '../types';

interface SearchFormProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories: Record<string, DecodedCategory>;
  allBranches: string[];
  allDistricts: string[];
}

export function SearchForm({
  filters,
  onFilterChange,
  categories,
  allBranches,
  allDistricts
}: SearchFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  // Handle inputs
  const handlePercentileChange = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    onFilterChange({ ...filters, percentile: clamped });
  };

  const handleCategoryChange = (val: string) => {
    onFilterChange({ ...filters, category: val });
  };

  const handleLevelChange = (val: string) => {
    onFilterChange({ ...filters, level: val === 'ALL' ? undefined : val });
  };

  const handleGenderChange = (val: string) => {
    onFilterChange({ ...filters, gender: val === 'ALL' ? undefined : val });
  };

  const toggleBranch = (branch: string) => {
    const current = filters.branches || [];
    const next = current.includes(branch)
      ? current.filter(b => b !== branch)
      : [...current, branch];
    onFilterChange({ ...filters, branches: next.length > 0 ? next : undefined });
  };

  const toggleDistrict = (district: string) => {
    const current = filters.districts || [];
    const next = current.includes(district)
      ? current.filter(d => d !== district)
      : [...current, district];
    onFilterChange({ ...filters, districts: next.length > 0 ? next : undefined });
  };

  const clearAllFilters = () => {
    onFilterChange({
      percentile: filters.percentile,
      category: filters.category,
      level: undefined,
      gender: undefined,
      branches: undefined,
      districts: undefined
    });
    setBranchSearch('');
    setDistrictSearch('');
  };

  // Sort and filter branches/districts based on search inputs
  const filteredBranches = allBranches
    .filter(b => b.toLowerCase().includes(branchSearch.toLowerCase()))
    .slice(0, 100); // limit display count for performance

  const filteredDistricts = allDistricts
    .filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()))
    .slice(0, 100);



  return (
    <div className="glass-panel rounded-md p-5 md:p-6 mb-6">
      
      {/* Primary Row: Percentile & Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        {/* Percentile Input */}
        <div className="md:col-span-2">
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
                value={filters.percentile}
                onChange={(e) => handlePercentileChange(parseFloat(e.target.value) || 0)}
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
              value={filters.percentile}
              onChange={(e) => handlePercentileChange(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--color-amber) 0%, var(--color-amber) ${filters.percentile}%, rgba(255,255,255,0.1) ${filters.percentile}%, rgba(255,255,255,0.1) 100%)`
              }}
              className="flex-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <label className="font-heading text-xs font-bold text-white uppercase tracking-wider block mb-2">
            CAP Reservation Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-sm text-xs font-medium cursor-pointer"
          >
            {Object.entries(categories)
              .filter(([code]) => !code.endsWith('H') && !code.endsWith('O'))
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([code, info]) => {
                const parts = info.label.split(',').slice(0, 2);
                const cleanLabel = parts.join(',').replace(/\s*\(General\)/, '');
                return (
                  <option key={code} value={code} className="text-slate-900">
                    {code.replace(/S$/, '')} — {cleanLabel}
                  </option>
                );
              })}
          </select>
        </div>

      </div>

      {/* Advanced Filter Collapsible Panel */}
      <div className="mt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-heading font-semibold text-white/50 hover:text-amber transition-colors cursor-pointer"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Filters</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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
                  { label: 'All Levels', value: 'ALL' },
                  { label: 'State Level (S)', value: 'S' },
                  { label: 'Home University (H)', value: 'H' },
                  { label: 'Other Than Home (O)', value: 'O' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber">
                    <input
                      type="radio"
                      name="levelScope"
                      checked={opt.value === 'ALL' ? !filters.level : filters.level === opt.value}
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
                Gender Quota Scope
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'All Quotas', value: 'ALL' },
                  { label: 'General / Co-Ed (G)', value: 'G' },
                  { label: 'Ladies Only (L)', value: 'L' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber">
                    <input
                      type="radio"
                      name="genderScope"
                      checked={opt.value === 'ALL' ? !filters.gender : filters.gender === opt.value}
                      onChange={() => handleGenderChange(opt.value)}
                      className="accent-amber"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* District Checklist Filter */}
            <div>
              <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                Districts / Locations
              </label>
              <input
                type="text"
                placeholder="Search districts..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full glass-input px-2 py-1 rounded-sm text-[11px] mb-2"
              />
              <div className="max-h-36 overflow-y-auto border border-white/10 rounded-sm p-2 flex flex-col gap-1.5 bg-white/5">
                {filteredDistricts.map(dist => (
                  <label key={dist} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber">
                    <input
                      type="checkbox"
                      checked={filters.districts?.includes(dist) || false}
                      onChange={() => toggleDistrict(dist)}
                      className="accent-amber"
                    />
                    <span className="truncate">{dist}</span>
                  </label>
                ))}
                {filteredDistricts.length === 0 && (
                  <span className="text-[10px] text-white/50">No districts found</span>
                )}
              </div>
            </div>

            {/* Branch Checklist Filter */}
            <div>
              <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                Course Branches
              </label>
              <input
                type="text"
                placeholder="Search branches..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="w-full glass-input px-2 py-1 rounded-sm text-[11px] mb-2"
              />
              <div className="max-h-36 overflow-y-auto border border-white/10 rounded-sm p-2 flex flex-col gap-1.5 bg-white/5">
                {filteredBranches.map(branch => (
                  <label key={branch} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-amber">
                    <input
                      type="checkbox"
                      checked={filters.branches?.includes(branch) || false}
                      onChange={() => toggleBranch(branch)}
                      className="accent-amber"
                    />
                    <span className="truncate" title={branch}>{branch}</span>
                  </label>
                ))}
                {filteredBranches.length === 0 && (
                  <span className="text-[10px] text-white/50">No branches found</span>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* active filters chips */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          {(filters.level || filters.gender || (filters.branches && filters.branches.length > 0) || (filters.districts && filters.districts.length > 0)) && (
            <>
              <span className="text-[10px] uppercase text-white/50 font-bold tracking-wider">Active:</span>
              {filters.level && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Level: {filters.level}
                </span>
              )}
              {filters.gender && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Gender: {filters.gender}
                </span>
              )}
              {filters.districts && filters.districts.length > 0 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Districts ({filters.districts.length})
                </span>
              )}
              {filters.branches && filters.branches.length > 0 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20 text-white rounded-sm font-medium">
                  Branches ({filters.branches.length})
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
        </div>
      )}

    </div>
  );
}
