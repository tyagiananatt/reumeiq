// =============================================================
// Resume Store — Local state management for demo resumes
// In production this connects to PostgreSQL via REST API
// =============================================================

import { AnalysisResult } from './atsAnalyzer';

export interface StoredResume {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  rawText: string;
  analysis: AnalysisResult | null;
  jobDescription?: string;
  status: 'analyzing' | 'complete' | 'error';
}

const STORAGE_KEY = 'resumeiq_resumes';

export function getResumes(): StoredResume[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultResumes();
  } catch {
    return getDefaultResumes();
  }
}

export function saveResume(resume: StoredResume): void {
  const existing = getResumes();
  const updated = [resume, ...existing].slice(0, 10); // keep max 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateResume(id: string, updates: Partial<StoredResume>): void {
  const existing = getResumes();
  const updated = existing.map(r => r.id === id ? { ...r, ...updates } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteResume(id: string): void {
  const existing = getResumes();
  const updated = existing.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getResumeById(id: string): StoredResume | undefined {
  return getResumes().find(r => r.id === id);
}

// Demo resumes pre-loaded for showcase
function getDefaultResumes(): StoredResume[] {
  const defaults: StoredResume[] = [
    {
      id: 'demo-1',
      fileName: 'Alex_Johnson_SoftwareEngineer.pdf',
      fileSize: 245760,
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      rawText: `Alex Johnson
alex@email.com | +1 (555) 123-4567 | LinkedIn: linkedin.com/in/alexj | GitHub: github.com/alexj

SUMMARY
Full-stack software engineer with 5+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Led teams of 6 engineers and improved system performance by 40%.

EXPERIENCE
Senior Software Engineer — TechCorp Inc. | 2021 - Present
• Architected microservices backend serving 2M+ daily active users
• Increased API performance by 40% through Redis caching and query optimization
• Led migration from monolith to Docker/Kubernetes infrastructure
• Mentored 4 junior engineers and conducted code reviews

Software Engineer — StartupXYZ | 2019 - 2021
• Built React dashboard with real-time analytics using WebSockets
• Developed REST APIs with Node.js and PostgreSQL
• Implemented CI/CD pipeline using GitHub Actions reducing deploy time by 60%

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019 | GPA: 3.8

SKILLS
JavaScript, TypeScript, React, Node.js, Express, Python, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, Redis, Git, CI/CD, GitHub Actions, REST API, GraphQL, Microservices, Agile, Scrum

CERTIFICATIONS
• AWS Certified Solutions Architect — Associate
• Docker Certified Associate`,
      analysis: null,
      status: 'complete',
    },
    {
      id: 'demo-2',
      fileName: 'Marketing_Resume_Sarah.pdf',
      fileSize: 189440,
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      rawText: `Sarah Williams
sarah@email.com | Marketing Manager

EXPERIENCE
Marketing Manager — Brand Co | 2020 - Present
Managed social media campaigns increasing engagement by 35%
Team player with strong communication skills

EDUCATION
Bachelor of Business Administration | 2016 - 2020

SKILLS
Marketing, SEO, Content Writing, Social Media, Leadership, Communication`,
      analysis: null,
      status: 'complete',
    },
  ];

  // Initialize with mock analysis
  defaults[0].analysis = {
    atsScore: 87,
    matchScore: 0,
    skillsFound: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'CI/CD', 'GitHub Actions', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'],
    missingSkills: [],
    suggestions: [
      'Add a portfolio website URL',
      'Include specific project metrics in each role',
      'Add relevant technical certifications prominently',
      'Consider adding open-source contributions',
    ],
    keywords: [
      { word: 'engineer', count: 4, important: false },
      { word: 'react', count: 3, important: true },
      { word: 'docker', count: 2, important: true },
      { word: 'postgresql', count: 2, important: true },
      { word: 'node.js', count: 2, important: true },
      { word: 'github', count: 2, important: true },
    ],
    sections: { contactInfo: true, summary: true, experience: true, education: true, skills: true, certifications: true },
    strengths: ['Strong technical skill set detected', 'Work experience section present', 'Education section is well-structured', 'Quantifiable achievements found', 'Certifications boost credibility', 'Good resume length for ATS'],
    weaknesses: [],
    wordCount: 287,
    readabilityScore: 92,
    formatScore: 95,
    keywordScore: 88,
    experienceScore: 85,
  };

  defaults[1].analysis = {
    atsScore: 52,
    matchScore: 0,
    skillsFound: ['Leadership', 'Communication', 'SEO'],
    missingSkills: ['Google Analytics', 'HubSpot', 'CRM', 'PPC', 'Email Marketing'],
    suggestions: [
      'Add quantifiable achievements with specific numbers',
      'Include tools like Google Analytics, HubSpot, Mailchimp',
      'Expand work experience with bullet points',
      'Add a professional summary section',
      'Include certifications like Google Analytics, HubSpot',
    ],
    keywords: [
      { word: 'marketing', count: 3, important: false },
      { word: 'communication', count: 2, important: false },
      { word: 'management', count: 2, important: false },
    ],
    sections: { contactInfo: true, summary: false, experience: true, education: true, skills: true, certifications: false },
    strengths: ['Work experience section present', 'Education section is well-structured'],
    weaknesses: ['Missing professional summary', 'No quantifiable achievements found', 'Too few technical skills listed', 'No certifications mentioned'],
    wordCount: 78,
    readabilityScore: 71,
    formatScore: 62,
    keywordScore: 38,
    experienceScore: 45,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}
