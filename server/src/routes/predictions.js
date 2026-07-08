import { Router } from "express";
import { College } from "../models/College.js";
import {
  predictAll,
  reversePredict,
  buildHeatmapData,
} from "../services/prediction.js";

const router = Router();

const CACHE_MAX_SIZE = 500;
const predictionCache = new Map();

// POST /api/predictions — run prediction engine
router.post("/", async (req, res) => {
  try {
    const { percentile, category, branches, districts, status } = req.body;

    if (percentile === undefined || !category) {
      res.status(400).json({ error: "percentile and category are required" });
      return;
    }

    const cacheKey = JSON.stringify({ percentile, category, branches, districts, status });
    if (predictionCache.has(cacheKey)) {
      // Move to end (LRU behavior)
      const cached = predictionCache.get(cacheKey);
      predictionCache.delete(cacheKey);
      predictionCache.set(cacheKey, cached);
      res.set("Cache-Control", "public, max-age=3600");
      return res.json(cached);
    }

    // Build MongoDB filter for pre-filtering colleges
    const filter = {};
    if (districts && districts.length > 0) {
      filter.district = { $in: districts };
    }

    // Lean query with projection (we don't need _id, timestamps, etc.)
    const colleges = await College.find(filter)
      .select("-_id -createdAt -updatedAt -__v")
      .lean();

    const results = predictAll(parseFloat(percentile), category, colleges, {
      branches,
      districts,
      status,
    });

    const responseData = {
      results,
      meta: {
        totalSafe: results.safe.length,
        totalModerate: results.moderate.length,
        totalReach: results.reach.length,
        percentile: parseFloat(percentile),
        category,
      },
    };

    if (predictionCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest (first item in Map)
      const firstKey = predictionCache.keys().next().value;
      predictionCache.delete(firstKey);
    }
    predictionCache.set(cacheKey, responseData);

    res.set("Cache-Control", "public, max-age=3600");
    res.json(responseData);
  } catch (error) {
    console.error("[Predictions] Error:", error);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// POST /api/predictions/reverse — reverse predictor
router.post("/reverse", async (req, res) => {
  try {
    const { collegeCode, choiceCode, category } = req.body;

    if (!collegeCode || !choiceCode || !category) {
      res
        .status(400)
        .json({ error: "collegeCode, choiceCode, and category are required" });
      return;
    }

    const college = await College.findOne({ collegeCode }).lean();
    if (!college) {
      res.status(404).json({ error: "College not found" });
      return;
    }

    const branch = college.branches.find((b) => b.choiceCode === choiceCode);
    if (!branch) {
      res.status(404).json({ error: "Branch not found" });
      return;
    }

    const prediction = reversePredict(branch, category);

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
      },
    });
  } catch (error) {
    console.error("[Predictions] Reverse error:", error);
    res.status(500).json({ error: "Reverse prediction failed" });
  }
});

// POST /api/predictions/heatmap — heatmap data
router.post("/heatmap", async (req, res) => {
  try {
    const { category, districts, branches } = req.body;

    if (!category) {
      res.status(400).json({ error: "category is required" });
      return;
    }

    const colleges = await College.find({}).lean();
    const heatmapData = buildHeatmapData(
      colleges,
      category,
      districts || [],
      branches || [],
    );

    res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error("[Predictions] Heatmap error:", error);
    res.status(500).json({ error: "Heatmap generation failed" });
  }
});

export default router;
