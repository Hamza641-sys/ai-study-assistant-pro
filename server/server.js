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

const app  = express();
// Railway provides PORT env var — must use it exactly
const PORT = process.env.PORT || 5000;

// Track DB connection state
let dbConnected = false;

// ─── Start server FIRST (before DB) so healthcheck passes ─────────────────────
// Railway healthcheck needs server to respond quickly
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://0.0.0.0:${PORT}/health\n`);
});

// Connect DB after server starts
connectDB().then(() => {
  dbConnected = true;
  console.log('✅ DB connected, all routes active');
}).catch((err) => {
  console.error('❌ DB connection failed:', err.message);
});

// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, /\.vercel\.app$/, /\.railway\.app$/]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiter
app.use('/api', generalLimiter);

// ─── Health Check — always returns 200 so Railway is happy ───────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Study Assistant API is running',
    db: dbConnected ? 'connected' : 'connecting',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Study Assistant Pro API',
    health: '/health',
    api: '/api',
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

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
