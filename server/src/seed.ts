/**
 * Database Seeder — Imports cutoffs.json from the static app into MongoDB
 * 
 * Usage: npx tsx src/seed.ts
 * 
 * Reads the existing public/data/cutoffs.json (13 MB) and bulk-inserts
 * all colleges with their branches and cutoff records into MongoDB.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { College } from './models/College';
import { Meta } from './models/Meta';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cap-predictor';

// Path to the existing cutoffs.json
const CUTOFFS_JSON_PATH = path.resolve(__dirname, '../../../cap-predictor/public/data/cutoffs.json');

interface CutoffJSON {
  meta: {
    years: number[];
    rounds: number[];
    generatedAt: string;
    totalRecords: number;
    totalColleges: number;
    totalBranches: number;
  };
  categories: Record<string, any>;
  colleges: Array<{
    collegeCode: string;
    collegeName: string;
    status: string;
    district: string;
    branches: Array<{
      choiceCode: string;
      courseName: string;
      cutoffs: Array<{
        year: number;
        round: number;
        category: string;
        rank: number;
        percentile: number;
        seatType: string;
        stage: string;
      }>;
    }>;
  }>;
}

async function seed() {
  console.log('🌱 CAP Predictor Database Seeder');
  console.log('================================\n');

  // Verify JSON file exists
  if (!fs.existsSync(CUTOFFS_JSON_PATH)) {
    console.error(`❌ cutoffs.json not found at: ${CUTOFFS_JSON_PATH}`);
    console.error('   Make sure the static app data file exists.');
    process.exit(1);
  }

  console.log(`📄 Reading: ${CUTOFFS_JSON_PATH}`);
  const rawData = fs.readFileSync(CUTOFFS_JSON_PATH, 'utf-8');
  const data: CutoffJSON = JSON.parse(rawData);

  console.log(`📊 Found: ${data.meta.totalColleges} colleges, ${data.meta.totalBranches} branches, ${data.meta.totalRecords} cutoff records`);
  console.log(`📅 Years: ${data.meta.years.join(', ')}`);
  console.log(`🔄 Rounds: ${data.meta.rounds.join(', ')}\n`);

  // Connect to MongoDB
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!\n');

  // Clear existing data
  const existingCount = await College.countDocuments();
  if (existingCount > 0) {
    console.log(`🗑️  Clearing ${existingCount} existing colleges...`);
    await College.deleteMany({});
  }

  // Bulk insert in batches
  const BATCH_SIZE = 50;
  const colleges = data.colleges;
  let inserted = 0;

  console.log(`📥 Inserting ${colleges.length} colleges in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < colleges.length; i += BATCH_SIZE) {
    const batch = colleges.slice(i, i + BATCH_SIZE);
    await College.insertMany(batch);
    inserted += batch.length;
    
    const progress = Math.round((inserted / colleges.length) * 100);
    process.stdout.write(`\r   Progress: ${inserted}/${colleges.length} (${progress}%)`);
  }

  console.log('\n');

  // Indexes are automatically created by Mongoose based on the Schema definitions

  // Store dataset metadata (category map + counts) for the client dropdowns
  console.log('🗂️  Storing dataset meta (categories)...');
  await Meta.findOneAndUpdate(
    { key: 'dataset' },
    {
      key: 'dataset',
      categories: data.categories || {},
      years: data.meta.years,
      rounds: data.meta.rounds,
      totalRecords: data.meta.totalRecords,
      totalColleges: data.meta.totalColleges,
      totalBranches: data.meta.totalBranches,
      generatedAt: data.meta.generatedAt,
    },
    { upsert: true, new: true }
  );

  // Verify
  const finalCount = await College.countDocuments();
  console.log(`\n✅ Seeding complete!`);
  console.log(`   📊 ${finalCount} colleges in database`);
  console.log(`   📅 Years: ${data.meta.years.join(', ')}`);
  console.log(`   🔢 Total cutoff records: ${data.meta.totalRecords}`);

  await mongoose.connection.close();
  console.log('\n🔌 MongoDB connection closed.');
}

seed().catch(err => {
  console.error('\n❌ Seeding failed:', err);
  process.exit(1);
});
