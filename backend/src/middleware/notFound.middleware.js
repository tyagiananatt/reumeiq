// ============================================================
// ResumeIQ — 404 Not Found Middleware
// ============================================================

'use strict';

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;
