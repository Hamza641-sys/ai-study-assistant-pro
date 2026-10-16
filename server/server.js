import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes         from './routes/authRoutes.js';
import documentRoutes     from './routes/documentRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import ragRoutes          from './routes/ragRoutes.js';
import summaryRoutes      from './routes/summaryRoutes.js';
import quizRoutes         from './routes/quizRoutes.js';
import dashboardRoutes    from './routes/dashboardRoutes.js';
import voiceRoutes        from './routes/voiceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
await connectDB();

// ─── App setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, /\.vercel\.app$/]
    : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));        // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Study Assistant API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/documents',     documentRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/rag',           ragRoutes);
app.use('/api/summaries',     summaryRoutes);
app.use('/api/quizzes',       quizRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/voice',         voiceRoutes);

// ─── 404 & Error Handlers (must be last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base:     http://localhost:${PORT}/api\n`);
});

export default app;
