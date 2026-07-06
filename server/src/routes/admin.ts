import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { College } from '../models/College';
import fs from 'fs';
import path from 'path';

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// POST /api/admin/upload — upload cutoffs JSON and seed into database
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { colleges, meta } = req.body;

    if (!colleges || !Array.isArray(colleges)) {
      res.status(400).json({ error: 'Request body must contain a "colleges" array' });
      return;
    }

    let inserted = 0;
    let updated = 0;

    for (const collegeData of colleges) {
      const existing = await College.findOne({ collegeCode: collegeData.collegeCode });

      if (existing) {
        // Merge branches — add new branches, append cutoffs to existing branches
        for (const newBranch of collegeData.branches) {
          const existingBranch = existing.branches.find(
            (b: any) => b.choiceCode === newBranch.choiceCode
          );

          if (existingBranch) {
            // Append only new cutoff records (avoid duplicates)
            for (const cutoff of newBranch.cutoffs) {
              const isDuplicate = existingBranch.cutoffs.some(
                (c: any) =>
                  c.year === cutoff.year &&
                  c.round === cutoff.round &&
                  c.category === cutoff.category
              );
              if (!isDuplicate) {
                existingBranch.cutoffs.push(cutoff);
              }
            }
          } else {
            existing.branches.push(newBranch);
          }
        }

        // Update college-level fields
        existing.collegeName = collegeData.collegeName || existing.collegeName;
        existing.status = collegeData.status || existing.status;
        existing.district = collegeData.district || existing.district;

        await existing.save();
        updated++;
      } else {
        await College.create(collegeData);
        inserted++;
      }
    }

    res.json({
      message: `Upload complete: ${inserted} new colleges, ${updated} updated colleges`,
      inserted,
      updated,
      total: inserted + updated,
    });
  } catch (error) {
    console.error('[Admin] Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/admin/stats — database statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalColleges = await College.countDocuments();
    const colleges = await College.find({}).lean();

    let totalBranches = 0;
    let totalCutoffs = 0;
    const yearsSet = new Set<number>();

    for (const college of colleges) {
      totalBranches += college.branches.length;
      for (const branch of college.branches) {
        totalCutoffs += branch.cutoffs.length;
        for (const cutoff of branch.cutoffs) {
          yearsSet.add(cutoff.year);
        }
      }
    }

    const districts = await College.distinct('district');

    res.json({
      stats: {
        totalColleges,
        totalBranches,
        totalCutoffs,
        years: Array.from(yearsSet).sort(),
        districts: districts.filter(Boolean).length,
      }
    });
  } catch (error) {
    console.error('[Admin] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// DELETE /api/admin/clear — clear all college data (dangerous!)
router.delete('/clear', async (_req: Request, res: Response) => {
  try {
    const result = await College.deleteMany({});
    res.json({
      message: `Cleared ${result.deletedCount} colleges from database`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[Admin] Clear error:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router;
