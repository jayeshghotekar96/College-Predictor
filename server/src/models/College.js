import mongoose, { Schema } from "mongoose";

// ── Sub-document interfaces ────────────────────────────────────────────

// ── Schemas ────────────────────────────────────────────────────────────

const CutoffRecordSchema = new Schema(
  {
    year: { type: Number, required: true },
    round: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    rank: { type: Number, required: true },
    percentile: { type: Number, required: true },
    seatType: { type: String, default: "" },
    stage: { type: String, default: "" },
  },
  { _id: false },
);

const BranchSchema = new Schema(
  {
    choiceCode: { type: String, required: true },
    courseName: { type: String, required: true },
    cutoffs: [CutoffRecordSchema],
  },
  { _id: false },
);

const CollegeSchema = new Schema(
  {
    collegeCode: { type: String, required: true, unique: true, index: true },
    collegeName: { type: String, required: true },
    status: { type: String, default: "" },
    district: { type: String, default: "", index: true },
    branches: [BranchSchema],
  },
  {
    timestamps: true,
    collection: "colleges",
  },
);

// Text index for search
CollegeSchema.index({ collegeName: "text", "branches.courseName": "text" });

// Performance Indexes
CollegeSchema.index({ "branches.courseName": 1 });
CollegeSchema.index({ "branches.cutoffs.category": 1, "branches.cutoffs.year": -1 });

export const College = mongoose.model("College", CollegeSchema);
