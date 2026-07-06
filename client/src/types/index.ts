/**
 * TypeScript types matching the data/cutoffs.json schema.
 * Generated from Phase 0 data pipeline output.
 */

// ── Cutoff Record ──────────────────────────────────────────────────────

export interface CutoffRecord {
  year: number;
  round: number;
  category: string;
  rank: number;
  percentile: number;
  seatType: string;
  stage: string;
}

// ── Branch (College + Course combination) ──────────────────────────────

export interface Branch {
  choiceCode: string;
  courseName: string;
  cutoffs: CutoffRecord[];
}

// ── College ────────────────────────────────────────────────────────────

export interface College {
  collegeCode: string;
  collegeName: string;
  status: string;
  district: string;
  branches: Branch[];
}

// ── Decoded Category ───────────────────────────────────────────────────

export interface DecodedCategory {
  code: string;
  label: string;
  group?: string;            // For standalone codes: TFWS, EWS, ORPHAN, MI
  reservation?: string;      // PWD or Defense
  reservationType?: string;  // "Common Reserved" for PWDR/DEFR
  gender?: string;           // "General (All Genders)" or "Ladies Only"
  genderCode?: string;       // "G" or "L"
  level?: string;            // "State Level", "Home University", "Other than Home University"
  levelCode?: string;        // "S", "H", "O"
  casteGroup?: string;       // OPEN, SC, ST, VJ, NT1, NT2, NT3, OBC, SEBC
  casteLabel?: string;       // Human readable label
  note?: string;             // e.g. "SEBC treated as equivalent to OBC"
}

// ── Metadata ───────────────────────────────────────────────────────────

export interface CutoffMeta {
  years: number[];
  rounds: number[];
  generatedAt: string;
  totalRecords: number;
  totalColleges: number;
  totalBranches: number;
}

// ── Root JSON Structure ────────────────────────────────────────────────

export interface CutoffData {
  meta: CutoffMeta;
  categories: Record<string, DecodedCategory>;
  colleges: College[];
}

// ── Prediction Types ───────────────────────────────────────────────────

export type ChanceLevel = "SAFE" | "MODERATE" | "REACH" | "UNLIKELY";

export type TrendDirection = "rising" | "falling" | "stable" | "insufficient-data";

export interface TrendProjection {
  projected: number;
  low: number;
  high: number;
  direction: TrendDirection;
}

export interface PredictionResult {
  college: College;
  branch: Branch;
  chance: ChanceLevel;
  latestCutoff: number;
  trend: TrendProjection;
  roundTiming: 1 | 2 | 3;
}

export interface ReversePrediction {
  requiredPercentile: number;
  confidence: "high" | "medium" | "low";
  roundLikely: 1 | 2 | 3;
}

// ── Filter Types ───────────────────────────────────────────────────────

export interface SearchFilters {
  percentile: number;
  category: string;
  level?: string;       // S, H, O
  gender?: string;      // G, L
  branches?: string[];  // course names
  districts?: string[]; // district names
}

// ── Shortlist ──────────────────────────────────────────────────────────

export interface ShortlistItem {
  collegeCode: string;
  choiceCode: string;
  collegeName: string;
  courseName: string;
  district: string;
  addedAt: string;
}

export type SortMode = "percentile" | "alphabetical" | "district";

export interface OptionFormItem {
  collegeCode: string;
  choiceCode: string;
  collegeName: string;
  courseName: string;
  district: string;
  rank: number;
  latestCutoff?: number;
}
