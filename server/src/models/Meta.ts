import mongoose, { Schema, Document } from 'mongoose';

/**
 * Meta — a single dataset-level document holding the decoded category map
 * and aggregate counts. Populated by the seeder from cutoffs.json so the
 * client can render category dropdowns dynamically from the API.
 */
export interface IMeta extends Document {
  key: string;
  categories: Record<string, any>;
  years: number[];
  rounds: number[];
  totalRecords: number;
  totalColleges: number;
  totalBranches: number;
  generatedAt: string;
}

const MetaSchema = new Schema<IMeta>({
  key: { type: String, required: true, unique: true, default: 'dataset' },
  categories: { type: Schema.Types.Mixed, default: {} },
  years: { type: [Number], default: [] },
  rounds: { type: [Number], default: [] },
  totalRecords: { type: Number, default: 0 },
  totalColleges: { type: Number, default: 0 },
  totalBranches: { type: Number, default: 0 },
  generatedAt: { type: String, default: '' },
}, {
  timestamps: true,
  collection: 'meta',
});

export const Meta = mongoose.model<IMeta>('Meta', MetaSchema);
