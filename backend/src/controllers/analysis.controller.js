// ============================================================
// ResumeIQ — Analysis Controller
// Handles ATS scoring and job description matching
// ============================================================

'use strict';

const { query } = require('../config/database');
const { analyzeResume, matchJobDescription } = require('../services/ats.service');

/**
 * GET /api/analysis/:resumeId
 * Get analysis results for a resume
 */
const getAnalysis = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ar.*, r.file_name, r.created_at as resume_date
       FROM analysis_results ar
       JOIN resumes r ON r.id = ar.resume_id
       WHERE ar.resume_id = $1 AND ar.user_id = $2
       ORDER BY ar.created_at DESC
       LIMIT 1`,
      [req.params.resumeId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found. The resume may still be processing.',
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analysis/:resumeId/job-match
 * Match resume against a job description
 */
const matchJob = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Job description must be at least 50 characters long.',
      });
    }

    // Get resume text
    const resumeResult = await query(
      'SELECT raw_text FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.resumeId, req.user.id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }

    const rawText = resumeResult.rows[0].raw_text;

    if (!rawText) {
      return res.status(400).json({
        success: false,
        error: 'Resume text not available yet. Please try again.',
      });
    }

    // Run matching
    const matchResult = await matchJobDescription(rawText, jobDescription);

    // Update analysis with job description data
    await query(
      `UPDATE analysis_results
       SET job_description = $1, match_score = $2
       WHERE resume_id = $3 AND user_id = $4`,
      [jobDescription, matchResult.matchScore, req.params.resumeId, req.user.id]
    );

    res.json({
      success: true,
      data: matchResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analysis/dashboard
 * Get dashboard analytics for the authenticated user
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await query(
      `SELECT
        COUNT(r.id) as total_resumes,
        AVG(ar.ats_score)::INTEGER as avg_score,
        MAX(ar.ats_score) as best_score,
        MIN(ar.ats_score) as lowest_score
       FROM resumes r
       LEFT JOIN analysis_results ar ON ar.resume_id = r.id
       WHERE r.user_id = $1`,
      [req.user.id]
    );

    const recent = await query(
      `SELECT r.file_name, ar.ats_score, r.created_at
       FROM resumes r
       JOIN analysis_results ar ON ar.resume_id = r.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        stats: stats.rows[0],
        recentResumes: recent.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalysis, matchJob, getDashboardStats };
