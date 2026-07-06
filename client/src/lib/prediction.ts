import type { College, Branch, CutoffRecord, ChanceLevel, TrendProjection, PredictionResult, ReversePrediction, TrendDirection } from '../types';

export function getEquivalentCategories(category: string): string[] {
  // If user picks an Open category, allow State, Home, and Other variants
  if (['GOPENS', 'GOPENH', 'GOPENO'].includes(category)) return ['GOPENS', 'GOPENH', 'GOPENO'];
  if (['LOPENS', 'LOPENH', 'LOPENO'].includes(category)) return ['LOPENS', 'LOPENH', 'LOPENO'];
  
  // Standard regex to catch S (State), H (Home), O (Other) suffixes
  const match = category.match(/^(.*?)(S|H|O)$/);
  if (match) {
    const base = match[1];
    return [`${base}S`, `${base}H`, `${base}O`];
  }
  return [category];
}

export function getBestMatchingCategory(cutoffs: CutoffRecord[], requestedCategory: string): string | null {
  // Try exact match first
  if (cutoffs.some(c => c.category === requestedCategory)) {
    return requestedCategory;
  }
  
  // Try equivalent variants (H, O, S)
  const equivalents = getEquivalentCategories(requestedCategory);
  for (const eq of equivalents) {
    if (cutoffs.some(c => c.category === eq)) {
      return eq;
    }
  }
  
  return null;
}

// ── Helper: Get Latest Year's Cutoff ───────────────────────────────────

export function getLatestCutoff(cutoffs: CutoffRecord[], category: string): number | null {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return null;
  
  // Find the maximum year in the history
  const maxYear = Math.max(...catCutoffs.map(c => c.year));
  const latestYearCutoffs = catCutoffs.filter(c => c.year === maxYear);
  
  // For the latest year, get the cutoff from the last available round
  const maxRound = Math.max(...latestYearCutoffs.map(c => c.round));
  const finalCutoff = latestYearCutoffs.find(c => c.round === maxRound);
  
  return finalCutoff ? finalCutoff.percentile : null;
}

// ── Step 1 & 2: Trend Projection & Chance Classification ────────────────

export function projectTrend(cutoffs: CutoffRecord[], category: string): TrendProjection {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  
  // Group by year and find the final cutoff for each year
  const yearCutoffs: { year: number; percentile: number }[] = [];
  const years = Array.from(new Set(catCutoffs.map(c => c.year))).sort();
  
  for (const y of years) {
    const yearData = catCutoffs.filter(c => c.year === y);
    const maxRound = Math.max(...yearData.map(c => c.round));
    const finalCutoff = yearData.find(c => c.round === maxRound);
    if (finalCutoff) {
      yearCutoffs.push({ year: y, percentile: finalCutoff.percentile });
    }
  }

  if (yearCutoffs.length === 0) {
    return { projected: 0, low: 0, high: 0, direction: "insufficient-data" };
  }

  // If we only have 1 year of data, we cannot project a trend
  if (yearCutoffs.length < 2) {
    const single = yearCutoffs[0].percentile;
    return {
      projected: single,
      low: Math.max(0, single - 1.0),
      high: Math.min(100, single + 1.0),
      direction: "insufficient-data"
    };
  }

  // Recency-weighted trend calculation
  // Weights: oldest year gets 1, next gets 2, newest gets 3 (or scaled accordingly)
  let weightedSum = 0;
  let weightSum = 0;
  
  for (let i = 0; i < yearCutoffs.length; i++) {
    const weight = i + 1; // 1 for oldest, 2 for middle, 3 for newest
    weightedSum += yearCutoffs[i].percentile * weight;
    weightSum += weight;
  }
  
  const projected = weightedSum / weightSum;
  
  // Calculate variance to establish a confidence range
  const percentiles = yearCutoffs.map(y => y.percentile);
  const latest = percentiles[percentiles.length - 1];
  const previous = percentiles[percentiles.length - 2];
  
  // Variance calculation: absolute differences year-over-year
  const diffs = [];
  for (let i = 1; i < percentiles.length; i++) {
    diffs.push(Math.abs(percentiles[i] - percentiles[i - 1]));
  }
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  
  // Confidence band (low/high) based on average historical variance, with a minimum buffer of 0.5%
  const buffer = Math.max(0.5, avgDiff * 1.2);
  const low = Math.max(0, projected - buffer);
  const high = Math.min(100, projected + buffer);
  
  // Determine direction
  let direction: TrendDirection = "stable";
  const trendDiff = latest - previous;
  if (trendDiff > 0.3) {
    direction = "rising";
  } else if (trendDiff < -0.3) {
    direction = "falling";
  }

  return {
    projected: Math.round(projected * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    direction
  };
}

export function classifyChance(
  studentPercentile: number,
  category: string,
  cutoffs: CutoffRecord[]
): ChanceLevel {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return "UNLIKELY";

  const trend = projectTrend(cutoffs, category);
  const projected = trend.projected;

  // Let's also look at the actual historical range to see if there's significant fluctuation
  const latestCutoff = getLatestCutoff(cutoffs, category);
  const refPercentile = latestCutoff !== null ? latestCutoff : projected;

  const diff = studentPercentile - refPercentile;

  // 1. SAFE: 2+ percentile points above the latest/projected cutoff
  if (diff >= 2.0) {
    return "SAFE";
  }
  // 2. MODERATE: Within ~1.5 point above or up to 0.5 points below the cutoff
  if (diff >= -0.5 && diff < 2.0) {
    return "MODERATE";
  }
  
  // 3. REACH: Below the cutoff but within historical round-to-round drop
  // Find the max round-to-round drop for this category in any year
  let maxRoundDrop = 1.0; // Default fallback
  const years = Array.from(new Set(catCutoffs.map(c => c.year)));
  for (const y of years) {
    const yearData = catCutoffs.filter(c => c.year === y).sort((a, b) => a.round - b.round);
    if (yearData.length >= 2) {
      const drop = yearData[0].percentile - yearData[yearData.length - 1].percentile;
      if (drop > maxRoundDrop) {
        maxRoundDrop = drop;
      }
    }
  }

  // Allow up to maxRoundDrop (or at least 2.5 points) below the latest cutoff for REACH
  const reachLimit = -Math.max(2.0, maxRoundDrop * 1.5);
  if (diff >= reachLimit && diff < -0.5) {
    return "REACH";
  }

  return "UNLIKELY";
}

// ── Step 3: Reverse Predictor ──────────────────────────────────────────

export function reversePredict(
  _college: College,
  branch: Branch,
  category: string
): ReversePrediction {
  const trend = projectTrend(branch.cutoffs, category);
  const timing = getRoundTiming(branch.cutoffs, category);
  
  // For SAFE classification, we need 2 percentile points above the projected/latest
  const latest = getLatestCutoff(branch.cutoffs, category);
  const baseline = latest !== null ? latest : trend.projected;
  const requiredPercentile = Math.round((baseline + 2.0) * 100) / 100;
  
  // Confidence determination
  const yearsWithData = new Set(branch.cutoffs.filter(c => c.category === category).map(c => c.year)).size;
  let confidence: "high" | "medium" | "low" = "low";
  if (yearsWithData >= 3) {
    confidence = "high";
  } else if (yearsWithData === 2) {
    confidence = "medium";
  }

  return {
    requiredPercentile: Math.min(100, Math.max(0, requiredPercentile)),
    confidence,
    roundLikely: timing
  };
}

// ── Step 4: CAP Round Timing Advisor ───────────────────────────────────

export function getRoundTiming(cutoffs: CutoffRecord[], category: string): 1 | 2 | 3 {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return 1;

  const years = Array.from(new Set(catCutoffs.map(c => c.year)));
  let round1Wins = 0;
  let round2Wins = 0;
  let round3Wins = 0;

  for (const y of years) {
    const yearData = catCutoffs.filter(c => c.year === y).sort((a, b) => a.round - b.round);
    if (yearData.length === 0) continue;

    const r1 = yearData.find(d => d.round === 1);
    const r2 = yearData.find(d => d.round === 2);
    const r3 = yearData.find(d => d.round === 3);

    // If it drops mostly between R1 and R2, R2 is likely.
    // If it drops more between R2 and R3, R3 is likely.
    // If it's stable throughout, R1 is likely.
    if (r1 && r2 && r3) {
      const drop12 = r1.percentile - r2.percentile;
      const drop23 = r2.percentile - r3.percentile;
      
      if (drop23 > 0.5 && drop23 > drop12) {
        round3Wins++;
      } else if (drop12 > 0.5) {
        round2Wins++;
      } else {
        round1Wins++;
      }
    } else if (r1 && r2) {
      const drop12 = r1.percentile - r2.percentile;
      if (drop12 > 0.5) {
        round2Wins++;
      } else {
        round1Wins++;
      }
    } else {
      round1Wins++;
    }
  }

  const maxWins = Math.max(round1Wins, round2Wins, round3Wins);
  if (maxWins === round3Wins && round3Wins > 0) return 3;
  if (maxWins === round2Wins && round2Wins > 0) return 2;
  return 1;
}

// ── Step 5: Predict All ────────────────────────────────────────────────

export function predictAll(
  studentPercentile: number,
  category: string,
  colleges: College[],
  filters: {
    branches?: string[];
    districts?: string[];
    status?: string[];
  } = {}
): { safe: PredictionResult[]; moderate: PredictionResult[]; reach: PredictionResult[] } {
  const safe: PredictionResult[] = [];
  const moderate: PredictionResult[] = [];
  const reach: PredictionResult[] = [];

  for (const college of colleges) {
    // District Filter
    if (filters.districts && filters.districts.length > 0) {
      if (!filters.districts.includes(college.district)) {
        continue;
      }
    }

    // Status Filter (Autonomous/Government/etc.)
    if (filters.status && filters.status.length > 0) {
      let matchesStatus = false;
      for (const s of filters.status) {
        if (college.status.toLowerCase().includes(s.toLowerCase())) {
          matchesStatus = true;
          break;
        }
      }
      if (!matchesStatus) continue;
    }

    for (const branch of college.branches) {
      // Branch Filter (Course Name)
      if (filters.branches && filters.branches.length > 0) {
        if (!filters.branches.includes(branch.courseName)) {
          continue;
        }
      }

      // Check if there are any cutoffs for this specific category or its equivalents
      const activeCategory = getBestMatchingCategory(branch.cutoffs, category);
      if (!activeCategory) continue;

      const chance = classifyChance(studentPercentile, activeCategory, branch.cutoffs);
      if (chance === "UNLIKELY") continue;

      const trend = projectTrend(branch.cutoffs, activeCategory);
      const latestCutoff = getLatestCutoff(branch.cutoffs, activeCategory) || trend.projected;
      const roundTiming = getRoundTiming(branch.cutoffs, activeCategory);

      const result: PredictionResult = {
        college,
        branch,
        chance,
        latestCutoff,
        trend,
        roundTiming,
        appliedCategory: activeCategory
      };

      if (chance === "SAFE") {
        safe.push(result);
      } else if (chance === "MODERATE") {
        moderate.push(result);
      } else if (chance === "REACH") {
        reach.push(result);
      }
    }
  }

  // Sort helper: order by latest cutoff percentile descending (most competitive first)
  const sortByPercentile = (a: PredictionResult, b: PredictionResult) => b.latestCutoff - a.latestCutoff;

  return {
    safe: safe.sort(sortByPercentile),
    moderate: moderate.sort(sortByPercentile),
    reach: reach.sort(sortByPercentile)
  };
}

// ── Step 6: Heatmap Data Builder ───────────────────────────────────────

export interface HeatmapCell {
  district: string;
  branch: string;
  avgPercentile: number;
  count: number;
}

export function buildHeatmapData(
  colleges: College[],
  category: string,
  targetDistricts: string[],
  targetBranches: string[]
): HeatmapCell[] {
  const cellMap = new Map<string, { sum: number; count: number }>();

  for (const college of colleges) {
    if (targetDistricts.length > 0 && !targetDistricts.includes(college.district)) {
      continue;
    }

    for (const branch of college.branches) {
      if (targetBranches.length > 0 && !targetBranches.includes(branch.courseName)) {
        continue;
      }

      // Check equivalent category
      const activeCategory = getBestMatchingCategory(branch.cutoffs, category);
      if (!activeCategory) continue;

      // Find the trend projection or latest cutoff for this category
      const trend = projectTrend(branch.cutoffs, activeCategory);
      if (trend.direction === "insufficient-data" && trend.projected === 0) {
        continue;
      }

      const val = getLatestCutoff(branch.cutoffs, activeCategory) || trend.projected;
      if (val === 0) continue;

      const key = `${college.district}||${branch.courseName}`;
      const existing = cellMap.get(key) || { sum: 0, count: 0 };
      cellMap.set(key, {
        sum: existing.sum + val,
        count: existing.count + 1
      });
    }
  }

  const result: HeatmapCell[] = [];
  cellMap.forEach((data, key) => {
    const [district, branch] = key.split("||");
    result.push({
      district,
      branch,
      avgPercentile: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count
    });
  });

  return result;
}
