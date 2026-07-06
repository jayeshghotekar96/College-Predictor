import { Router, Request, Response } from 'express';
import { College } from '../models/College';
import { predictAll, reversePredict, buildHeatmapData } from '../services/prediction';

const router = Router();

// POST /api/predictions — run prediction engine
router.post('/', async (req: Request, res: Response) => {
  try {
    const { percentile, category, branches, districts, status } = req.body;

    if (percentile === undefined || !category) {
      res.status(400).json({ error: 'percentile and category are required' });
      return;
    }

    // Build MongoDB filter for pre-filtering colleges
    const filter: any = {};
    if (districts && districts.length > 0) {
      filter.district = { $in: districts };
    }

    const colleges = await College.find(filter).lean();

    const results = predictAll(
      parseFloat(percentile),
      category,
      colleges as any,
      { branches, districts, status }
    );

    res.json({
      results,
      meta: {
        totalSafe: results.safe.length,
        totalModerate: results.moderate.length,
        totalReach: results.reach.length,
        percentile: parseFloat(percentile),
        category,
      }
    });
  } catch (error) {
    console.error('[Predictions] Error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// POST /api/predictions/reverse — reverse predictor
router.post('/reverse', async (req: Request, res: Response) => {
  try {
    const { collegeCode, choiceCode, category } = req.body;

    if (!collegeCode || !choiceCode || !category) {
      res.status(400).json({ error: 'collegeCode, choiceCode, and category are required' });
      return;
    }

    const college = await College.findOne({ collegeCode }).lean();
    if (!college) {
      res.status(404).json({ error: 'College not found' });
      return;
    }

    const branch = college.branches.find(b => b.choiceCode === choiceCode);
    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    const prediction = reversePredict(branch as any, category);

    res.json({
      prediction,
      college: {
        collegeCode: college.collegeCode,
        collegeName: college.collegeName,
        district: college.district,
      },
      branch: {
        choiceCode: branch.choiceCode,
        courseName: branch.courseName,
      }
    });
  } catch (error) {
    console.error('[Predictions] Reverse error:', error);
    res.status(500).json({ error: 'Reverse prediction failed' });
  }
});

// POST /api/predictions/heatmap — heatmap data
router.post('/heatmap', async (req: Request, res: Response) => {
  try {
    const { category, districts, branches } = req.body;

    if (!category) {
      res.status(400).json({ error: 'category is required' });
      return;
    }

    const colleges = await College.find({}).lean();
    const heatmapData = buildHeatmapData(
      colleges as any,
      category,
      districts || [],
      branches || []
    );

    res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error('[Predictions] Heatmap error:', error);
    res.status(500).json({ error: 'Heatmap generation failed' });
  }
});

export default router;
