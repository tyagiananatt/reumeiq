// =============================================================
// ATS Analyzer Service — Keyword-based ATS scoring engine
// In production, this would call the backend API
// =============================================================

export interface AnalysisResult {
  atsScore: number;
  matchScore: number;
  skillsFound: string[];
  missingSkills: string[];
  suggestions: string[];
  keywords: { word: string; count: number; important: boolean }[];
  sections: {
    contactInfo: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    certifications: boolean;
  };
  strengths: string[];
  weaknesses: string[];
  wordCount: number;
  readabilityScore: number;
  formatScore: number;
  keywordScore: number;
  experienceScore: number;
}

// Common tech skills database
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

const SECTION_KEYWORDS = {
  contactInfo: ['email', '@', 'phone', 'linkedin', 'github', 'portfolio', 'address'],
  summary: ['summary', 'objective', 'profile', 'about', 'overview'],
  experience: ['experience', 'work history', 'employment', 'position', 'role', 'job'],
  education: ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd', 'diploma'],
  skills: ['skills', 'technologies', 'tools', 'competencies', 'expertise', 'proficiencies'],
  certifications: ['certification', 'certificate', 'certified', 'aws certified', 'google certified'],
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
  'Spell out acronyms at first use',
  'Use industry-standard job titles',
  'Add measurable impact metrics to each role',
  'Ensure contact information is in the header',
  'Use plain text formatting without special characters',
];

function extractText(content: string): string {
  return content.toLowerCase().replace(/[^\w\s@.-]/g, ' ');
}

function detectSections(text: string) {
  const lower = text.toLowerCase();
  return {
    contactInfo: SECTION_KEYWORDS.contactInfo.some(k => lower.includes(k)),
    summary: SECTION_KEYWORDS.summary.some(k => lower.includes(k)),
    experience: SECTION_KEYWORDS.experience.some(k => lower.includes(k)),
    education: SECTION_KEYWORDS.education.some(k => lower.includes(k)),
    skills: SECTION_KEYWORDS.skills.some(k => lower.includes(k)),
    certifications: SECTION_KEYWORDS.certifications.some(k => lower.includes(k)),
  };
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return [...TECH_SKILLS, ...SOFT_SKILLS].filter(skill =>
    lower.includes(skill.toLowerCase())
  );
}

function extractKeywords(text: string): { word: string; count: number; important: boolean }[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const important = new Set(TECH_SKILLS.map(s => s.toLowerCase()));

  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({
      word,
      count,
      important: important.has(word),
    }));
}

function calculateFormatScore(text: string, sections: Record<string, boolean>): number {
  let score = 0;
  const sectionCount = Object.values(sections).filter(Boolean).length;
  score += (sectionCount / 6) * 40; // up to 40 points for sections

  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 700) score += 30;
  else if (wordCount > 700 && wordCount <= 1000) score += 20;
  else if (wordCount > 100) score += 10;

  if (text.includes('@')) score += 15; // has email
  if (text.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) score += 15; // has phone

  return Math.min(100, Math.round(score));
}

export function analyzeResume(resumeText: string, jobDescription?: string): AnalysisResult {
  const cleanText = extractText(resumeText);
  const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
  const sections = detectSections(cleanText);
  const skillsFound = extractSkills(cleanText);
  const keywords = extractKeywords(cleanText);
  const formatScore = calculateFormatScore(cleanText, sections);

  // Keyword score based on skill density
  const keywordScore = Math.min(100, Math.round((skillsFound.length / 15) * 100));

  // Experience score — look for years, dates, company names
  const hasYears = /\b(20\d{2}|19\d{2})\b/.test(resumeText);
  const hasBullets = resumeText.includes('•') || resumeText.includes('-') || resumeText.includes('*');
  const hasMetrics = /\d+%|\d+\+|increased|decreased|improved|managed|led|built/i.test(resumeText);
  const experienceScore = Math.round(
    (hasYears ? 35 : 0) + (hasBullets ? 30 : 0) + (hasMetrics ? 35 : 0)
  );

  // Readability score
  const avgWordLength = cleanText.replace(/\s+/g, '').length / Math.max(wordCount, 1);
  const readabilityScore = Math.min(100, Math.round(100 - (avgWordLength - 4) * 10));

  // ATS Score — weighted combination
  const atsScore = Math.round(
    formatScore * 0.3 +
    keywordScore * 0.3 +
    experienceScore * 0.25 +
    readabilityScore * 0.15
  );

  // Job description matching
  let matchScore = 0;
  let missingSkills: string[] = [];

  if (jobDescription) {
    const jobText = extractText(jobDescription);
    const jobSkills = extractSkills(jobText);
    const matched = jobSkills.filter(s => skillsFound.map(x => x.toLowerCase()).includes(s.toLowerCase()));
    missingSkills = jobSkills.filter(s => !skillsFound.map(x => x.toLowerCase()).includes(s.toLowerCase()));
    matchScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  }

  // Strengths
  const strengths: string[] = [];
  if (skillsFound.length >= 10) strengths.push('Strong technical skill set detected');
  if (sections.experience) strengths.push('Work experience section present');
  if (sections.education) strengths.push('Education section is well-structured');
  if (hasMetrics) strengths.push('Quantifiable achievements found');
  if (sections.certifications) strengths.push('Certifications boost credibility');
  if (wordCount >= 300) strengths.push('Good resume length for ATS');

  // Weaknesses
  const weaknesses: string[] = [];
  if (!sections.summary) weaknesses.push('Missing professional summary');
  if (!sections.contactInfo) weaknesses.push('Contact information unclear');
  if (!hasMetrics) weaknesses.push('No quantifiable achievements found');
  if (skillsFound.length < 5) weaknesses.push('Too few technical skills listed');
  if (!sections.certifications) weaknesses.push('No certifications mentioned');
  if (wordCount < 200) weaknesses.push('Resume is too short');

  // Suggestions
  const suggestions = IMPROVEMENT_TIPS
    .filter(() => Math.random() > 0.4)
    .slice(0, 6);

  return {
    atsScore: Math.max(20, Math.min(99, atsScore)),
    matchScore: Math.max(0, Math.min(100, matchScore)),
    skillsFound,
    missingSkills,
    suggestions,
    keywords,
    sections,
    strengths,
    weaknesses,
    wordCount,
    readabilityScore: Math.max(40, Math.min(99, readabilityScore)),
    formatScore: Math.max(30, Math.min(99, formatScore)),
    keywordScore: Math.max(20, Math.min(99, keywordScore)),
    experienceScore: Math.max(20, Math.min(99, experienceScore)),
  };
}

export function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score >= 65) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 45) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#3b82f6';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}
