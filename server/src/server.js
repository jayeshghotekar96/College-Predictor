import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";

// Route imports
import collegeRoutes from "./routes/colleges.js";
import predictionRoutes from "./routes/predictions.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// ── Middleware ──────────────────────────────────────────────────────────

app.use(compression());
app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json({ limit: "50mb" })); // Large payloads for data uploads
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────

app.use("/api/colleges", collegeRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/admin", adminRoutes);

// ── Health Check ───────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Serve React Client in Production ───────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(import.meta.dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));

  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ── Error Handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start Server ───────────────────────────────────────────────────────

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 CAP Predictor API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎓 College data: http://localhost:${PORT}/api/colleges/*`);
    console.log(`📈 Predictions: http://localhost:${PORT}/api/predictions/*\n`);
  });
}

start().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
