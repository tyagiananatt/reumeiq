// ============================================================
// ResumeIQ — ATS Scoring Service
// Keyword-based ATS analysis engine
// Falls back to Gemini AI if API key is available
// ============================================================

'use strict';

const axios = require('axios');
const { GEMINI_API_KEY, GEMINI_API_URL } = require('../config/env');

// Technical skills database
const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Git', 'Linux', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'SQL',
  'HTML', 'CSS', 'Tailwind', 'SASS', 'Webpack', 'Vite',
  'Next.js', 'Nuxt.js', 'FastAPI', 'Nginx', 'Terraform', 'Ansible',
];

const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Problem Solving', 'Team Player', 'Collaboration',
  'Critical Thinking', 'Project Management', 'Time Management', 'Adaptability',
];

const ALL_SKILLS = [...TECH_SKILLS, ...SOFT_SKILLS];

const SECTION_KEYWORDS = {
  contactInfo: ['email', '@', 'phone', 'linkedin', 'github'],
  summary: ['summary', 'objective', 'profile', 'about'],
  experience: ['experience', 'work history', 'employment', 'position'],
  education: ['education', 'degree', 'university', 'college', 'bachelor', 'master'],
  skills: ['skills', 'technologies', 'tools', 'competencies'],
  certifications: ['certification', 'certificate', 'certified'],
};

const IMPROVEMENT_TIPS = [
  'Add quantifiable achievements (e.g., "Increased performance by 40%")',
  'Use strong action verbs at the start of bullet points',
  'Include a professional summary or objective statement',
  'Ensure consistent date formatting throughout',
  'Add LinkedIn profile URL and GitHub link',
  'Tailor your resume keywords to match the job description',
  'Keep resume to 1-2 pages for optimal ATS parsing',
  'Use standard section headings for better ATS recognition',
  'Avoid tables, columns, and graphics that confuse ATS scanners',
  'Include relevant certifications and courses',
];

/**
 * Extract text and run ATS analysis
 * @param {string} text - Resume plain text
 * @returns {Object} Analysis result
 */
const analyzeResume = async (text) => {
  // Try Gemini AI if API key available
  if (GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(text);
    } catch (err) {
      console.warn('Gemini API failed, falling back to keyword analysis:', err.message);
    }
  }

  // Keyword-based analysis (fallback)
  return keywordAnalysis(text);
};

/**
 * Gemini AI-powered analysis
 */
const analyzeWithGemini = async (text) => {
  const prompt = `
Analyze the following resume and provide an ATS score and detailed analysis.

Resume:
${text.substring(0, 3000)}

Respond with valid JSON:
{
  "atsScore": <0-100>,
  "formatScore": <0-100>,
  "keywordScore": <0-100>,
  "experienceScore": <0-100>,
  "readabilityScore": <0-100>,
  "skillsFound": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"]
}
`;

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    },
    { timeout: 10000 }
  );

  const content = response.data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid Gemini response');
  return JSON.parse(jsonMatch[0]);
};

/**
 * Keyword-based ATS analysis (free, no API needed)
 */
const keywordAnalysis = (text) => {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Detect sections
  const sections = {};
  Object.entries(SECTION_KEYWORDS).forEach(([key, keywords]) => {
    sections[key] = keywords.some(k => lower.includes(k));
  });

  // Extract skills
  const skillsFound = ALL_SKILLS.filter(s => lower.includes(s.toLowerCase()));

  // Calculate scores
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const formatScore = Math.min(100, Math.round(
    (sectionCount / 6) * 40 +
    (wordCount >= 300 && wordCount <= 700 ? 30 : wordCount > 100 ? 15 : 5) +
    (text.includes('@') ? 15 : 0) +
    (text.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ? 15 : 0)
  ));

  const keywordScore = Math.min(100, Math.round((skillsFound.length / 15) * 100));

  const hasYears = /\b(20\d{2}|19\d{2})\b/.test(text);
  const hasBullets = /[•\-*]/.test(text);
  const hasMetrics = /\d+%|\d+\+|increased|decreased|improved|managed|led|built/i.test(text);
  const experienceScore = Math.round(
    (hasYears ? 35 : 0) + (hasBullets ? 30 : 0) + (hasMetrics ? 35 : 0)
  );

  const avgWordLen = text.replace(/\s+/g, '').length / Math.max(wordCount, 1);
  const readabilityScore = Math.min(100, Math.round(100 - (avgWordLen - 4) * 10));

  const atsScore = Math.round(
    formatScore * 0.3 + keywordScore * 0.3 + experienceScore * 0.25 + readabilityScore * 0.15
  );

  const strengths = [];
  if (skillsFound.length >= 10) strengths.push('Strong technical skill set detected');
  if (sections.experience) strengths.push('Work experience section present');
  if (sections.education) strengths.push('Education section is well-structured');
  if (hasMetrics) strengths.push('Quantifiable achievements found');
  if (sections.certifications) strengths.push('Certifications boost credibility');

  const weaknesses = [];
  if (!sections.summary) weaknesses.push('Missing professional summary');
  if (!sections.contactInfo) weaknesses.push('Contact information unclear');
  if (!hasMetrics) weaknesses.push('No quantifiable achievements found');
  if (skillsFound.length < 5) weaknesses.push('Too few technical skills listed');

  const keywords = extractKeywords(text);

  return {
    atsScore: Math.max(20, Math.min(99, atsScore)),
    formatScore: Math.max(30, Math.min(99, formatScore)),
    keywordScore: Math.max(20, Math.min(99, keywordScore)),
    experienceScore: Math.max(20, Math.min(99, experienceScore)),
    readabilityScore: Math.max(40, Math.min(99, readabilityScore)),
    skillsFound,
    missingSkills: [],
    suggestions: IMPROVEMENT_TIPS.slice(0, 6),
    keywords,
    sections,
    strengths,
    weaknesses,
    wordCount,
  };
};

/**
 * Match resume against job description
 */
const matchJobDescription = async (resumeText, jobDescription) => {
  const resumeAnalysis = await analyzeResume(resumeText);
  const jobLower = jobDescription.toLowerCase();
  const jobSkills = ALL_SKILLS.filter(s => jobLower.includes(s.toLowerCase()));
  const foundSkills = resumeAnalysis.skillsFound.map(s => s.toLowerCase());
  const matched = jobSkills.filter(s => foundSkills.includes(s.toLowerCase()));
  const missing = jobSkills.filter(s => !foundSkills.includes(s.toLowerCase()));
  const matchScore = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 0;

  return {
    ...resumeAnalysis,
    matchScore: Math.max(0, Math.min(100, matchScore)),
    missingSkills: missing,
    jobSkillsRequired: jobSkills,
    matchedSkills: matched,
  };
};

/**
 * Extract keyword frequency from text
 */
function extractKeywords(text) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const important = new Set(TECH_SKILLS.map(s => s.toLowerCase()));
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count, important: important.has(word) }));
}

module.exports = { analyzeResume, matchJobDescription };
