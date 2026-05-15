// ============================================================
// ResumeIQ — Express Application Entry Point
// Production-ready Node.js backend
// ============================================================

'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Config
const { PORT, CORS_ORIGIN, NODE_ENV } = require('./config/env');

// Routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const analysisRoutes = require('./routes/analysis.routes');
const healthRoutes = require('./routes/health.routes');

// Middleware
const errorHandler = require('./middleware/error.middleware');
const notFound = require('./middleware/notFound.middleware');

const app = express();

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ============================================================
// Rate Limiting
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts, please try again in 15 minutes.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, error: 'Upload limit reached. Please try again in an hour.' },
});

app.use(globalLimiter);

// ============================================================
// Body Parsing Middleware
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Logging
// ============================================================
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ============================================================
// Static Files — serve uploaded resumes
// ============================================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================================
// API Routes
// ============================================================
app.use('/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/resumes', uploadLimiter, resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// ============================================================
// Error Handling
// ============================================================
app.use(notFound);
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║         ResumeIQ API Server          ║
  ╠══════════════════════════════════════╣
  ║  Environment : ${(NODE_ENV || 'development').padEnd(20)} ║
  ║  Port        : ${String(PORT).padEnd(20)} ║
  ║  Status      : Running ✓             ║
  ╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;
