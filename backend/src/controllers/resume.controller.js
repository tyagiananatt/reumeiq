// ============================================================
// ResumeIQ — Resume Controller
// Handles resume upload, retrieval, and deletion
// ============================================================

'use strict';

const path = require('path');
const fs = require('fs').promises;
const { query } = require('../config/database');
const { extractText } = require('../services/parser.service');
const { analyzeResume } = require('../services/ats.service');

/**
 * POST /api/resumes/upload
 * Upload a resume file and trigger analysis
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    const userId = req.user.id;

    // Insert resume record
    const result = await query(
      `INSERT INTO resumes (user_id, file_name, file_path, file_size, file_type, status)
       VALUES ($1, $2, $3, $4, $5, 'analyzing')
       RETURNING id, file_name, file_size, status, created_at`,
      [userId, originalname, filePath, size, mimetype]
    );

    const resume = result.rows[0];

    // Extract text asynchronously
    setImmediate(async () => {
      try {
        const rawText = await extractText(filePath, mimetype);

        // Update resume with extracted text
        await query(
          'UPDATE resumes SET raw_text = $1, status = $2 WHERE id = $3',
          [rawText, 'complete', resume.id]
        );

        // Run ATS analysis
        const analysis = await analyzeResume(rawText);

        // Save analysis results
        await query(
          `INSERT INTO analysis_results
           (resume_id, user_id, ats_score, format_score, keyword_score, experience_score,
            readability_score, skills_found, missing_skills, suggestions, keywords,
            sections, strengths, weaknesses, word_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            resume.id, userId,
            analysis.atsScore, analysis.formatScore, analysis.keywordScore,
            analysis.experienceScore, analysis.readabilityScore,
            JSON.stringify(analysis.skillsFound),
            JSON.stringify(analysis.missingSkills),
            JSON.stringify(analysis.suggestions),
            JSON.stringify(analysis.keywords),
            JSON.stringify(analysis.sections),
            JSON.stringify(analysis.strengths),
            JSON.stringify(analysis.weaknesses),
            analysis.wordCount,
          ]
        );

        console.log(`✅ Analysis complete for resume ${resume.id}: ATS Score = ${analysis.atsScore}`);
      } catch (err) {
        console.error('Analysis error:', err.message);
        await query(
          'UPDATE resumes SET status = $1 WHERE id = $2',
          ['error', resume.id]
        );
      }
    });

    res.status(202).json({
      success: true,
      message: 'Resume uploaded. Analysis in progress.',
      data: {
        resumeId: resume.id,
        fileName: resume.file_name,
        fileSize: resume.file_size,
        status: 'analyzing',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
const getResumes = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.id, r.file_name, r.file_size, r.file_type, r.status, r.created_at,
              ar.ats_score, ar.skills_found, ar.sections
       FROM resumes r
       LEFT JOIN analysis_results ar ON ar.resume_id = r.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/:id
 * Get a single resume with full analysis
 */
const getResume = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, ar.*
       FROM resumes r
       LEFT JOIN analysis_results ar ON ar.resume_id = r.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resumes/:id
 * Delete a resume and its file
 */
const deleteResume = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT file_path FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }

    // Delete file
    try {
      await fs.unlink(result.rows[0].file_path);
    } catch (fileError) {
      console.warn('File deletion warning:', fileError.message);
    }

    // Delete from database (cascades to analysis_results)
    await query('DELETE FROM resumes WHERE id = $1', [req.params.id]);

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumes, getResume, deleteResume };
