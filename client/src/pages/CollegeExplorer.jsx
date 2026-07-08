import React, { useState, useMemo, useRef, useDeferredValue } from "react";
import { useData } from "../lib/DataContext";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  MapPin,
  Search,
  GraduationCap,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

export function CollegeExplorer() {
  const { data, loading, error } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "All",
  );
  const [districtFilter, setDistrictFilter] = useState("All");

  const districts = useMemo(() => {
    if (!data) return [];
    const set = new Set();
    data.colleges.forEach((c) => {
      if (c.district && c.district !== "Unknown") set.add(c.district);
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredColleges = useMemo(() => {
    if (!data) return [];
    return data.colleges.filter((c) => {
      // Search
      const searchLower = deferredSearchTerm.toLowerCase();
      if (
        searchLower &&
        !c.collegeName.toLowerCase().includes(searchLower) &&
        !c.collegeCode.toString().includes(searchLower)
      ) {
        return false;
      }
      // Type
      if (typeFilter !== "All") {
        const nameLower = c.collegeName.toLowerCase();
        if (typeFilter === "Govt" && !nameLower.includes("government"))
          return false;
        if (typeFilter === "Autonomous" && !nameLower.includes("autonomous"))
          return false;
        // Approximation for Private (not govt)
        if (typeFilter === "Private" && nameLower.includes("government"))
          return false;
      }

      // District
      if (districtFilter !== "All" && c.district !== districtFilter) {
        return false;
      }

      return true;
    });
  }, [data, deferredSearchTerm, typeFilter, districtFilter]);

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredColleges.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Estimated card height
    overscan: 5,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Loading colleges...
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        Error loading data.
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-900 pb-20 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-white/5 py-12 shrink-0">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight mb-4">
            College Explorer
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Browse through {data.colleges.length} engineering institutions in
            Maharashtra. Discover top colleges and analyze cutoff trends.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row gap-8 flex-1 w-full overflow-hidden">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <h2 className="font-heading font-bold text-white mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" /> Filters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.value) newParams.set("q", e.target.value);
                      else newParams.delete("q");
                      setSearchParams(newParams, { replace: true });
                    }}
                    className="w-full glass-input pl-9 pr-3 py-2 rounded-lg text-sm text-white"
                    placeholder="College name or code..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Institute Type
                </label>
                <div className="flex flex-col gap-2">
                  {["All", "Govt", "Private", "Autonomous"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        const newParams = new URLSearchParams(searchParams);
                        if (type !== "All") newParams.set("type", type);
                        else newParams.delete("type");
                        setSearchParams(newParams, { replace: true });
                      }}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        typeFilter === type
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-300 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {type === "Govt" ? "Government" : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-sm text-white outline-none cursor-pointer"
                >
                  <option value="All">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d} className="bg-slate-800">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main List */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="mb-4 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-heading font-bold text-white">
              Showing {filteredColleges.length} Colleges
            </h2>
          </div>

          <div
            ref={parentRef}
            className="flex-1 overflow-y-auto custom-scrollbar relative pr-2"
          >
            {filteredColleges.length > 0 ? (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const college = filteredColleges[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: "1rem", // gap replacement
                      }}
                    >
                      <Link
                        to={`/colleges/${college.collegeCode}`}
                        className="block glass-panel p-5 rounded-2xl border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group h-full flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                              {college.collegeName}
                            </h3>
                            <span className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 bg-white/10 text-slate-300 rounded border border-white/10">
                              {college.collegeCode}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />{" "}
                              {college.district}
                            </span>
                            {college.collegeName
                              .toLowerCase()
                              .includes("autonomous") && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />{" "}
                                Autonomous
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-indigo-400" />{" "}
                              {college.branches.length} Branches
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-blue-400 font-semibold text-sm group-hover:text-blue-300">
                          <span>View Details & Cutoffs</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
                <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-2">
                  No colleges found
                </h3>
                <p className="text-slate-400">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("All");
                    setDistrictFilter("All");
                    setSearchParams({}, { replace: true });
                  }}
                  className="mt-6 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-semibold transition-colors border border-blue-500/30"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
