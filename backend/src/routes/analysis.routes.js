// ============================================================
// ResumeIQ — Analysis Routes
// ============================================================

'use strict';

const router = require('express').Router();
const { getAnalysis, matchJob, getDashboardStats } = require('../controllers/analysis.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateAnalysis } = require('../middleware/validation.middleware');

router.use(authenticate);

// GET /api/analysis/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/analysis/:resumeId
router.get('/:resumeId', validateAnalysis, getAnalysis);

// POST /api/analysis/:resumeId/job-match
router.post('/:resumeId/job-match', validateAnalysis, matchJob);

module.exports = router;
