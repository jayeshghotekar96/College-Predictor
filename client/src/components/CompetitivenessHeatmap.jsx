import { useState } from "react";
import { buildHeatmapData } from "../lib/prediction";

const DEFAULT_DISTRICTS = [
  "Pune",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Kolhapur",
  "Amravati",
  "Aurangabad",
  "Thane",
];
const DEFAULT_BRANCHES = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Telecommunication Engg",
  "Artificial Intelligence and Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

export function CompetitivenessHeatmap({
  colleges,
  category,
  allBranches,
  allDistricts,
  onCellClick,
}) {
  const [selectedDistricts, setSelectedDistricts] = useState(
    allDistricts.filter((d) => DEFAULT_DISTRICTS.includes(d)).slice(0, 8),
  );
  const [selectedBranches, setSelectedBranches] = useState(
    allBranches.filter((b) => DEFAULT_BRANCHES.includes(b)).slice(0, 7),
  );

  const heatmapData = buildHeatmapData(
    colleges,
    category,
    selectedDistricts,
    selectedBranches,
  );

  // Map data to a grid lookup
  const grid = {};
  heatmapData.forEach((cell) => {
    grid[`${cell.district}||${cell.branch}`] = cell.avgPercentile;
  });

  // Calculate cell background intensity based on percentile
  const getCellColor = (percentile) => {
    if (percentile === undefined) return "bg-white/5 text-white/30";
    // Scale opacity based on percentile (typically range from 50 to 100)
    const minVal = 50;
    const maxVal = 100;
    const ratio = Math.max(
      0,
      Math.min(1, (percentile - minVal) / (maxVal - minVal)),
    );
    // Color: Deep Teal for safe/high competitiveness
    return {
      backgroundColor: `rgba(31, 122, 92, ${0.1 + ratio * 0.85})`,
      color: "white",
    };
  };

  return (
    <div className="glass-panel rounded-md p-5 md:p-6 mb-6">
      {/* Description Header */}
      <div className="mb-4">
        <h3 className="font-heading text-sm font-bold text-white">
          District × Branch Competitiveness Heatmap
        </h3>
        <p className="text-xs text-white/50 mt-1">
          Grid cells display the average cutoff percentile for the selected
          category. Darker cells represent more competitive (higher cutoff)
          choices. Click a cell to filter options.
        </p>
      </div>

      {/* Grid Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-3 border-t border-white/10">
        <div>
          <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Customize Districts (Max 8)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allDistricts.slice(0, 16).map((dist) => {
              const active = selectedDistricts.includes(dist);
              return (
                <button
                  key={dist}
                  onClick={() => {
                    if (active) {
                      setSelectedDistricts(
                        selectedDistricts.filter((d) => d !== dist),
                      );
                    } else if (selectedDistricts.length < 8) {
                      setSelectedDistricts([...selectedDistricts, dist]);
                    }
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                    active
                      ? "bg-white/20 text-white border-white/30 font-semibold"
                      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1.5">
            Customize Branches (Max 7)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allBranches.slice(0, 12).map((branch) => {
              const active = selectedBranches.includes(branch);
              // Short label
              const short =
                branch
                  .replace("Engineering", "Engg.")
                  .replace("and", "&")
                  .slice(0, 18) + (branch.length > 18 ? ".." : "");
              return (
                <button
                  key={branch}
                  onClick={() => {
                    if (active) {
                      setSelectedBranches(
                        selectedBranches.filter((b) => b !== branch),
                      );
                    } else if (selectedBranches.length < 7) {
                      setSelectedBranches([...selectedBranches, branch]);
                    }
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-sm border transition-colors cursor-pointer ${
                    active
                      ? "bg-white/20 text-white border-white/30 font-semibold"
                      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                  title={branch}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto border border-white/10 rounded-sm">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/10">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-left font-heading text-[10px] font-bold text-white/70 uppercase tracking-wider w-28 bg-transparent sticky left-0 z-10 border-r border-white/20 backdrop-blur-md"
              >
                District
              </th>
              {selectedBranches.map((branch) => {
                const shortName = branch
                  .replace("Engineering", "Engg")
                  .replace("and", "&");
                return (
                  <th
                    key={branch}
                    scope="col"
                    className="px-3 py-2 text-center font-heading text-[10px] font-bold text-white/50 uppercase tracking-wider min-w-[120px]"
                    title={branch}
                  >
                    {shortName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {selectedDistricts.map((district) => (
              <tr key={district} className="hover:bg-white/5">
                <td className="px-3 py-2 text-xs font-semibold text-white/80 bg-white/5 backdrop-blur-md sticky left-0 z-10 border-r border-white/20 font-heading">
                  {district}
                </td>
                {selectedBranches.map((branch) => {
                  const val = grid[`${district}||${branch}`];
                  const style = getCellColor(val);
                  return (
                    <td
                      key={branch}
                      onClick={() =>
                        val !== undefined && onCellClick(district, branch)
                      }
                      style={typeof style === "object" ? style : undefined}
                      className={`px-3 py-3 text-center text-xs font-semibold cursor-pointer transition-transform active:scale-95 mono ${
                        val === undefined
                          ? "bg-white/5 text-white/20 border border-transparent"
                          : ""
                      }`}
                    >
                      {val !== undefined ? `${val.toFixed(1)}%` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
