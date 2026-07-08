import { Router } from "express";
import { College } from "../models/College.js";
import { Meta } from "../models/Meta.js";

const router = Router();

// In-memory cache for heavy dataset payloads (Data only changes yearly)
const cache = {};

// GET /api/colleges/category-map — decoded category map for dropdowns
router.get("/category-map", async (_req, res) => {
  try {
    if (cache["category-map"]) {
      res.set("Cache-Control", "public, max-age=86400");
      return res.json(cache["category-map"]);
    }
    const meta = await Meta.findOne({ key: "dataset" }).lean();
    const data = { categories: meta?.categories || {} };
    cache["category-map"] = data;
    res.set("Cache-Control", "public, max-age=86400");
    res.json(data);
  } catch (error) {
    console.error("[Colleges] Category-map error:", error);
    res.status(500).json({ error: "Failed to fetch category map" });
  }
});

// GET /api/colleges — list all colleges (paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const district = req.query.district;
    const search = req.query.search;

    const filter = {};
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { collegeName: { $regex: search, $options: "i" } },
        { collegeCode: { $regex: search, $options: "i" } },
        { "branches.courseName": { $regex: search, $options: "i" } },
        { "branches.choiceCode": { $regex: search, $options: "i" } },
      ];
    }

    const total = await College.countDocuments(filter);
    const colleges = await College.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.set("Cache-Control", "public, max-age=3600");
    res.json({
      colleges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Colleges] List error:", error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

// GET /api/colleges/all — return ALL colleges (for prediction engine)
router.get("/all", async (_req, res) => {
  try {
    if (cache["all"]) {
      res.set("Cache-Control", "public, max-age=86400");
      return res.json(cache["all"]);
    }
    const colleges = await College.find({}).lean();
    const data = { colleges };
    cache["all"] = data;
    res.set("Cache-Control", "public, max-age=86400");
    res.json(data);
  } catch (error) {
    console.error("[Colleges] All error:", error);
    res.status(500).json({ error: "Failed to fetch all colleges" });
  }
});

// GET /api/colleges/branches — unique branch/course names
router.get("/branches", async (_req, res) => {
  try {
    const branches = await College.distinct("branches.courseName");
    res.json({ branches: branches.filter(Boolean).sort() });
  } catch (error) {
    console.error("[Colleges] Branches error:", error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

// GET /api/colleges/districts — unique district names
router.get("/districts", async (_req, res) => {
  try {
    const districts = await College.distinct("district");
    res.json({
      districts: districts.filter((d) => d && d !== "Unknown").sort(),
    });
  } catch (error) {
    console.error("[Colleges] Districts error:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// GET /api/colleges/categories — unique category codes from cutoffs
router.get("/categories", async (_req, res) => {
  try {
    const categories = await College.distinct("branches.cutoffs.category");
    res.json({ categories: categories.filter(Boolean).sort() });
  } catch (error) {
    console.error("[Colleges] Categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/colleges/meta — dataset metadata
router.get("/meta", async (_req, res) => {
  try {
    if (cache["meta"]) {
      res.set("Cache-Control", "public, max-age=86400");
      return res.json(cache["meta"]);
    }
    const totalColleges = await College.countDocuments();
    const colleges = await College.find({}).lean();
    let totalBranches = 0;
    let totalRecords = 0;
    const yearsSet = new Set();
    const roundsSet = new Set();

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

    const data = {
      meta: {
        totalColleges,
        totalBranches,
        totalRecords,
        years: Array.from(yearsSet).sort(),
        rounds: Array.from(roundsSet).sort(),
      },
    };
    cache["meta"] = data;
    res.set("Cache-Control", "public, max-age=86400");
    res.json(data);
  } catch (error) {
    console.error("[Colleges] Meta error:", error);
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
});

// GET /api/colleges/:code — single college by code
router.get("/:code", async (req, res) => {
  try {
    const college = await College.findOne({
      collegeCode: req.params.code,
    }).lean();
    if (!college) {
      res.status(404).json({ error: "College not found" });
      return;
    }
    res.json({ college });
  } catch (error) {
    console.error("[Colleges] Get error:", error);
    res.status(500).json({ error: "Failed to fetch college" });
  }
});

// Internal Cache Warmup
setTimeout(async () => {
  try {
    console.log("[Colleges] Warming up in-memory cache...");
    // Warm up /category-map
    const metaDoc = await Meta.findOne({ key: "dataset" }).lean();
    cache["category-map"] = { categories: metaDoc?.categories || {} };

    // Warm up /all
    const allColleges = await College.find({}).lean();
    cache["all"] = { colleges: allColleges };

    // Warm up /meta
    const totalColleges = allColleges.length;
    let totalBranches = 0;
    let totalRecords = 0;
    const yearsSet = new Set();
    const roundsSet = new Set();

    for (const college of allColleges) {
      totalBranches += college.branches.length;
      for (const branch of college.branches) {
        totalRecords += branch.cutoffs.length;
        for (const cutoff of branch.cutoffs) {
          yearsSet.add(cutoff.year);
          roundsSet.add(cutoff.round);
        }
      }
    }

    cache["meta"] = {
      meta: {
        totalColleges,
        totalBranches,
        totalRecords,
        years: Array.from(yearsSet).sort(),
        rounds: Array.from(roundsSet).sort(),
      },
    };

    console.log("[Colleges] Cache warmup complete!");
  } catch (err) {
    console.error("[Colleges] Cache warmup failed:", err);
  }
}, 2000); // Wait 2s after startup to ensure DB is connected

export default router;
