import mongoose, { Schema, Document } from 'mongoose';

// ── Sub-document interfaces ────────────────────────────────────────────

export interface ICutoffRecord {
  year: number;
  round: number;
  category: string;
  rank: number;
  percentile: number;
  seatType: string;
  stage: string;
}

export interface IBranch {
  choiceCode: string;
  courseName: string;
  cutoffs: ICutoffRecord[];
}

export interface ICollege extends Document {
  collegeCode: string;
  collegeName: string;
  status: string;
  district: string;
  branches: IBranch[];
}

// ── Schemas ────────────────────────────────────────────────────────────

const CutoffRecordSchema = new Schema<ICutoffRecord>({
  year: { type: Number, required: true },
  round: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  rank: { type: Number, required: true },
  percentile: { type: Number, required: true },
  seatType: { type: String, default: '' },
  stage: { type: String, default: '' },
}, { _id: false });

const BranchSchema = new Schema<IBranch>({
  choiceCode: { type: String, required: true },
  courseName: { type: String, required: true },
  cutoffs: [CutoffRecordSchema],
}, { _id: false });

const CollegeSchema = new Schema<ICollege>({
  collegeCode: { type: String, required: true, unique: true, index: true },
  collegeName: { type: String, required: true },
  status: { type: String, default: '' },
  district: { type: String, default: '', index: true },
  branches: [BranchSchema],
}, {
  timestamps: true,
  collection: 'colleges',
});

// Text index for search
CollegeSchema.index({ collegeName: 'text', 'branches.courseName': 'text' });

export const College = mongoose.model<ICollege>('College', CollegeSchema);
