import { Router, Request, Response } from 'express';
import { College } from '../models/College';
import { Meta } from '../models/Meta';

const router = Router();

// GET /api/colleges/category-map — decoded category map for dropdowns
router.get('/category-map', async (_req: Request, res: Response) => {
  try {
    const meta = await Meta.findOne({ key: 'dataset' }).lean();
    res.json({ categories: meta?.categories || {} });
  } catch (error) {
    console.error('[Colleges] Category-map error:', error);
    res.status(500).json({ error: 'Failed to fetch category map' });
  }
});

// GET /api/colleges — list all colleges (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const district = req.query.district as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { collegeName: { $regex: search, $options: 'i' } },
        { collegeCode: { $regex: search, $options: 'i' } },
        { 'branches.courseName': { $regex: search, $options: 'i' } },
        { 'branches.choiceCode': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await College.countDocuments(filter);
    const colleges = await College.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      colleges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('[Colleges] List error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// GET /api/colleges/all — return ALL colleges (for prediction engine)
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const colleges = await College.find({}).lean();
    res.json({ colleges });
  } catch (error) {
    console.error('[Colleges] All error:', error);
    res.status(500).json({ error: 'Failed to fetch all colleges' });
  }
});

// GET /api/colleges/branches — unique branch/course names
router.get('/branches', async (_req: Request, res: Response) => {
  try {
    const branches = await College.distinct('branches.courseName');
    res.json({ branches: branches.filter(Boolean).sort() });
  } catch (error) {
    console.error('[Colleges] Branches error:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// GET /api/colleges/districts — unique district names
router.get('/districts', async (_req: Request, res: Response) => {
  try {
    const districts = await College.distinct('district');
    res.json({ districts: districts.filter((d: string) => d && d !== 'Unknown').sort() });
  } catch (error) {
    console.error('[Colleges] Districts error:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// GET /api/colleges/categories — unique category codes from cutoffs
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await College.distinct('branches.cutoffs.category');
    res.json({ categories: categories.filter(Boolean).sort() });
  } catch (error) {
    console.error('[Colleges] Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/colleges/meta — dataset metadata
router.get('/meta', async (_req: Request, res: Response) => {
  try {
    const totalColleges = await College.countDocuments();
    const colleges = await College.find({}).lean();
    
    let totalBranches = 0;
    let totalRecords = 0;
    const yearsSet = new Set<number>();
    const roundsSet = new Set<number>();

    for (const college of colleges) {
      totalBranches += college.branches.length;
      for (const branch of college.branches) {
        totalRecords += branch.cutoffs.length;
        for (const cutoff of branch.cutoffs) {
          yearsSet.add(cutoff.year);
          roundsSet.add(cutoff.round);
        }
      }
    }

    res.json({
      meta: {
        totalColleges,
        totalBranches,
        totalRecords,
        years: Array.from(yearsSet).sort(),
        rounds: Array.from(roundsSet).sort(),
      }
    });
  } catch (error) {
    console.error('[Colleges] Meta error:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// GET /api/colleges/:code — single college by code
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const college = await College.findOne({ collegeCode: req.params.code }).lean();
    if (!college) {
      res.status(404).json({ error: 'College not found' });
      return;
    }
    res.json({ college });
  } catch (error) {
    console.error('[Colleges] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
});

export default router;
