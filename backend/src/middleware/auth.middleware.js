// ============================================================
// ResumeIQ — JWT Authentication Middleware
// Validates Bearer tokens on protected routes
// ============================================================

'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Middleware to verify JWT token
 * Adds decoded user data to req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      plan: decoded.plan,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error.',
    });
  }
};

/**
 * Optional authentication — attaches user if token present but doesn't block
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource.',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = { authenticate, optionalAuth, authorize };
