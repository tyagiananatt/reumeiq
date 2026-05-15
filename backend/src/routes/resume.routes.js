// ============================================================
// ResumeIQ — Resume Routes
// ============================================================

'use strict';

const router = require('express').Router();
const { uploadResume, getResumes, getResume, deleteResume } = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// All resume routes require authentication
router.use(authenticate);

// POST /api/resumes/upload
router.post('/upload', upload.single('resume'), uploadResume);

// GET /api/resumes
router.get('/', getResumes);

// GET /api/resumes/:id
router.get('/:id', getResume);

// DELETE /api/resumes/:id
router.delete('/:id', deleteResume);

module.exports = router;
