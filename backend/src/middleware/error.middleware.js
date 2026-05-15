// ============================================================
// ResumeIQ — Global Error Handler Middleware
// Centralized error handling for all routes
// ============================================================

'use strict';

const { NODE_ENV } = require('../config/env');

/**
 * Global error handling middleware
 * Must have 4 parameters (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Referenced resource not found';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Maximum 5MB allowed.';
    } else {
      message = 'File upload error: ' + err.message;
    }
  }

  // Log error (use proper logger in production)
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ERROR ${statusCode}:`, {
      message: err.message,
      stack: NODE_ENV === 'development' ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
