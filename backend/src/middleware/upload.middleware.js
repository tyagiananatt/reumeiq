// ============================================================
// ResumeIQ — File Upload Middleware (Multer)
// Handles PDF/DOCX file uploads with validation
// ============================================================

'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_PATH, MAX_FILE_SIZE } = require('../config/env');

// Ensure upload directory exists
const uploadDir = path.resolve(UPLOAD_PATH || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user-specific directory
    const userId = req.user?.id || 'anonymous';
    const userDir = path.join(uploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
    const basename = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const filename = `${Date.now()}-${basename}${ext}`;
    cb(null, filename);
  },
});

// File filter — validates file type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

module.exports = { upload };
