import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Route imports
import collegeRoutes from './routes/colleges';
import predictionRoutes from './routes/predictions';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ── Middleware ──────────────────────────────────────────────────────────

app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.CLIENT_URL || 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); // Large payloads for data uploads
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────

app.use('/api/colleges', collegeRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ───────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Serve React Client in Production ───────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ── Error Handler ──────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
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

start().catch(err => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
