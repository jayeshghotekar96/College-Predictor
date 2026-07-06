/**
 * Prediction Engine — Server-side migration of client prediction.ts
 * Same algorithms: projectTrend, classifyChance, predictAll, reversePredict, buildHeatmapData
 */

import { ICutoffRecord, IBranch, ICollege } from '../models/College';

// ── Types ──────────────────────────────────────────────────────────────

export type ChanceLevel = 'SAFE' | 'MODERATE' | 'REACH' | 'UNLIKELY';
export type TrendDirection = 'rising' | 'falling' | 'stable' | 'insufficient-data';

export interface TrendProjection {
  projected: number;
  low: number;
  high: number;
  direction: TrendDirection;
}

export interface PredictionResult {
  college: {
    collegeCode: string;
    collegeName: string;
    status: string;
    district: string;
  };
  branch: {
    choiceCode: string;
    courseName: string;
    cutoffs: ICutoffRecord[];
  };
  chance: ChanceLevel;
  latestCutoff: number;
  trend: TrendProjection;
  roundTiming: 1 | 2 | 3;
}

export interface ReversePrediction {
  requiredPercentile: number;
  confidence: 'high' | 'medium' | 'low';
  roundLikely: 1 | 2 | 3;
}

export interface HeatmapCell {
  district: string;
  branch: string;
  avgPercentile: number;
  count: number;
}

// ── Helper: Get Latest Year's Cutoff ───────────────────────────────────

export function getLatestCutoff(cutoffs: ICutoffRecord[], category: string): number | null {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return null;

  const maxYear = Math.max(...catCutoffs.map(c => c.year));
  const latestYearCutoffs = catCutoffs.filter(c => c.year === maxYear);

  const maxRound = Math.max(...latestYearCutoffs.map(c => c.round));
  const finalCutoff = latestYearCutoffs.find(c => c.round === maxRound);

  return finalCutoff ? finalCutoff.percentile : null;
}

// ── Trend Projection ───────────────────────────────────────────────────

export function projectTrend(cutoffs: ICutoffRecord[], category: string): TrendProjection {
  const catCutoffs = cutoffs.filter(c => c.category === category);

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
    return { projected: 0, low: 0, high: 0, direction: 'insufficient-data' };
  }

  if (yearCutoffs.length < 2) {
    const single = yearCutoffs[0].percentile;
    return {
      projected: single,
      low: Math.max(0, single - 1.0),
      high: Math.min(100, single + 1.0),
      direction: 'insufficient-data'
    };
  }

  // Recency-weighted trend
  let weightedSum = 0;
  let weightSum = 0;
  for (let i = 0; i < yearCutoffs.length; i++) {
    const weight = i + 1;
    weightedSum += yearCutoffs[i].percentile * weight;
    weightSum += weight;
  }
  const projected = weightedSum / weightSum;

  const percentiles = yearCutoffs.map(y => y.percentile);
  const latest = percentiles[percentiles.length - 1];
  const previous = percentiles[percentiles.length - 2];

  const diffs = [];
  for (let i = 1; i < percentiles.length; i++) {
    diffs.push(Math.abs(percentiles[i] - percentiles[i - 1]));
  }
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  const buffer = Math.max(0.5, avgDiff * 1.2);
  const low = Math.max(0, projected - buffer);
  const high = Math.min(100, projected + buffer);

  let direction: TrendDirection = 'stable';
  const trendDiff = latest - previous;
  if (trendDiff > 0.3) direction = 'rising';
  else if (trendDiff < -0.3) direction = 'falling';

  return {
    projected: Math.round(projected * 100) / 100,
    low: Math.round(low * 100) / 100,
    high: Math.round(high * 100) / 100,
    direction
  };
}

// ── Chance Classification ──────────────────────────────────────────────

export function classifyChance(
  studentPercentile: number,
  category: string,
  cutoffs: ICutoffRecord[]
): ChanceLevel {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return 'UNLIKELY';

  const trend = projectTrend(cutoffs, category);
  const latestCutoff = getLatestCutoff(cutoffs, category);
  const refPercentile = latestCutoff !== null ? latestCutoff : trend.projected;

  const diff = studentPercentile - refPercentile;

  if (diff >= 2.0) return 'SAFE';
  if (diff >= -0.5 && diff < 2.0) return 'MODERATE';

  // REACH: find max round-to-round drop
  let maxRoundDrop = 1.0;
  const years = Array.from(new Set(catCutoffs.map(c => c.year)));
  for (const y of years) {
    const yearData = catCutoffs.filter(c => c.year === y).sort((a, b) => a.round - b.round);
    if (yearData.length >= 2) {
      const drop = yearData[0].percentile - yearData[yearData.length - 1].percentile;
      if (drop > maxRoundDrop) maxRoundDrop = drop;
    }
  }

  const reachLimit = -Math.max(2.0, maxRoundDrop * 1.5);
  if (diff >= reachLimit && diff < -0.5) return 'REACH';

  return 'UNLIKELY';
}

// ── Round Timing Advisor ───────────────────────────────────────────────

export function getRoundTiming(cutoffs: ICutoffRecord[], category: string): 1 | 2 | 3 {
  const catCutoffs = cutoffs.filter(c => c.category === category);
  if (catCutoffs.length === 0) return 1;

  const years = Array.from(new Set(catCutoffs.map(c => c.year)));
  let round1Wins = 0, round2Wins = 0, round3Wins = 0;

  for (const y of years) {
    const yearData = catCutoffs.filter(c => c.year === y).sort((a, b) => a.round - b.round);
    if (yearData.length === 0) continue;

    const r1 = yearData.find(d => d.round === 1);
    const r2 = yearData.find(d => d.round === 2);
    const r3 = yearData.find(d => d.round === 3);

    if (r1 && r2 && r3) {
      const drop12 = r1.percentile - r2.percentile;
      const drop23 = r2.percentile - r3.percentile;
      if (drop23 > 0.5 && drop23 > drop12) round3Wins++;
      else if (drop12 > 0.5) round2Wins++;
      else round1Wins++;
    } else if (r1 && r2) {
      if (r1.percentile - r2.percentile > 0.5) round2Wins++;
      else round1Wins++;
    } else {
      round1Wins++;
    }
  }

  const maxWins = Math.max(round1Wins, round2Wins, round3Wins);
  if (maxWins === round3Wins && round3Wins > 0) return 3;
  if (maxWins === round2Wins && round2Wins > 0) return 2;
  return 1;
}

// ── Predict All ────────────────────────────────────────────────────────

export function predictAll(
  studentPercentile: number,
  category: string,
  colleges: ICollege[],
  filters: { branches?: string[]; districts?: string[]; status?: string[] } = {}
): { safe: PredictionResult[]; moderate: PredictionResult[]; reach: PredictionResult[] } {
  const safe: PredictionResult[] = [];
  const moderate: PredictionResult[] = [];
  const reach: PredictionResult[] = [];

  for (const college of colleges) {
    if (filters.districts && filters.districts.length > 0) {
      if (!filters.districts.includes(college.district)) continue;
    }
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
      if (filters.branches && filters.branches.length > 0) {
        if (!filters.branches.includes(branch.courseName)) continue;
      }

      const hasCategory = branch.cutoffs.some(c => c.category === category);
      if (!hasCategory) continue;

      const chance = classifyChance(studentPercentile, category, branch.cutoffs);
      if (chance === 'UNLIKELY') continue;

      const trend = projectTrend(branch.cutoffs, category);
      const latestCutoff = getLatestCutoff(branch.cutoffs, category) || trend.projected;
      const roundTiming = getRoundTiming(branch.cutoffs, category);

      const result: PredictionResult = {
        college: {
          collegeCode: college.collegeCode,
          collegeName: college.collegeName,
          status: college.status,
          district: college.district,
        },
        branch: {
          choiceCode: branch.choiceCode,
          courseName: branch.courseName,
          cutoffs: branch.cutoffs,
        },
        chance,
        latestCutoff,
        trend,
        roundTiming
      };

      if (chance === 'SAFE') safe.push(result);
      else if (chance === 'MODERATE') moderate.push(result);
      else if (chance === 'REACH') reach.push(result);
    }
  }

  const sortByPercentile = (a: PredictionResult, b: PredictionResult) => b.latestCutoff - a.latestCutoff;

  return {
    safe: safe.sort(sortByPercentile),
    moderate: moderate.sort(sortByPercentile),
    reach: reach.sort(sortByPercentile)
  };
}

// ── Reverse Predictor ──────────────────────────────────────────────────

export function reversePredict(
  branch: IBranch,
  category: string
): ReversePrediction {
  const trend = projectTrend(branch.cutoffs, category);
  const timing = getRoundTiming(branch.cutoffs, category);

  const latest = getLatestCutoff(branch.cutoffs, category);
  const baseline = latest !== null ? latest : trend.projected;
  const requiredPercentile = Math.round((baseline + 2.0) * 100) / 100;

  const yearsWithData = new Set(branch.cutoffs.filter(c => c.category === category).map(c => c.year)).size;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (yearsWithData >= 3) confidence = 'high';
  else if (yearsWithData === 2) confidence = 'medium';

  return {
    requiredPercentile: Math.min(100, Math.max(0, requiredPercentile)),
    confidence,
    roundLikely: timing
  };
}

// ── Heatmap Data Builder ───────────────────────────────────────────────

export function buildHeatmapData(
  colleges: ICollege[],
  category: string,
  targetDistricts: string[],
  targetBranches: string[]
): HeatmapCell[] {
  const cellMap = new Map<string, { sum: number; count: number }>();

  for (const college of colleges) {
    if (targetDistricts.length > 0 && !targetDistricts.includes(college.district)) continue;

    for (const branch of college.branches) {
      if (targetBranches.length > 0 && !targetBranches.includes(branch.courseName)) continue;

      const trend = projectTrend(branch.cutoffs, category);
      if (trend.direction === 'insufficient-data' && trend.projected === 0) continue;

      const val = getLatestCutoff(branch.cutoffs, category) || trend.projected;
      if (val === 0) continue;

      const key = `${college.district}||${branch.courseName}`;
      const existing = cellMap.get(key) || { sum: 0, count: 0 };
      cellMap.set(key, { sum: existing.sum + val, count: existing.count + 1 });
    }
  }

  const result: HeatmapCell[] = [];
  cellMap.forEach((data, key) => {
    const [district, branch] = key.split('||');
    result.push({
      district,
      branch,
      avgPercentile: Math.round((data.sum / data.count) * 100) / 100,
      count: data.count
    });
  });

  return result;
}
