// ============================================================
// ResumeIQ — Document Parser Service
// Extracts plain text from PDF, DOCX, and TXT files
// ============================================================

'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Extract text from uploaded file
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text
 */
const extractText = async (filePath, mimeType) => {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractFromPDF(filePath);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractFromDOCX(filePath);

      case 'text/plain':
        return await extractFromTXT(filePath);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error.message);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

/**
 * Extract text from PDF using pdf-parse
 */
const extractFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parse error:', error.message);
    // Return empty string if pdf-parse is not installed
    return 'PDF content could not be extracted. Please ensure pdf-parse is installed.';
  }
};

/**
 * Extract text from DOCX using mammoth
 */
const extractFromDOCX = async (filePath) => {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parse error:', error.message);
    return 'DOCX content could not be extracted. Please ensure mammoth is installed.';
  }
};

/**
 * Extract text from plain text file
 */
const extractFromTXT = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
};

module.exports = { extractText };
