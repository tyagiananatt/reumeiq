// ============================================================
// ResumeIQ — Request Validation Middleware
// Input validation and sanitization
// ============================================================

'use strict';

/**
 * Validate registration input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }
  if (name && name.length > 100) {
    errors.push('Name cannot exceed 100 characters.');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }
  if (password && password.length > 100) {
    errors.push('Password cannot exceed 100 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitize
  req.body.name = name.trim();
  req.body.email = email.toLowerCase().trim();

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

/**
 * Validate analysis request
 */
const validateAnalysis = (req, res, next) => {
  const { resumeId } = req.params;

  if (!resumeId || !isValidUUID(resumeId)) {
    return res.status(400).json({
      success: false,
      error: 'Valid resume ID is required.',
    });
  }

  next();
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

module.exports = { validateRegister, validateLogin, validateAnalysis };
