import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ChevronDown, Zap, Target, CheckCircle, XCircle,
  TrendingUp, FileText, RefreshCw, Info
} from 'lucide-react';
import { getResumes, getResumeById, StoredResume } from '../services/resumeStore';
import { analyzeResume, getScoreLabel, getScoreColor } from '../services/atsAnalyzer';
import SkillBadge from '../components/SkillBadge';
import ProgressBar from '../components/ProgressBar';
import ScoreCircle from '../components/ScoreCircle';
import toast from 'react-hot-toast';

const SAMPLE_JD = `Senior Full-Stack Engineer — TechCorp

About the Role:
We are looking for a Senior Full-Stack Engineer to join our growing platform team. You'll work on building scalable, high-performance web applications used by millions of users.

Requirements:
• 4+ years of experience with React and TypeScript
• Strong backend skills in Node.js and Express
• Experience with PostgreSQL and MongoDB databases
• Proficiency with Docker and Kubernetes
• Experience with AWS (EC2, S3, Lambda)
• CI/CD experience with GitHub Actions or Jenkins
• Strong understanding of REST APIs and GraphQL
• Experience with microservices architecture
• Agile/Scrum methodology experience
• Python or Go is a plus
• Redis caching experience preferred
• Strong Git workflow knowledge

Nice to Have:
• Terraform or Infrastructure as Code experience
• Nginx configuration experience
• Machine Learning or AI integration experience
• Open source contributions

What we offer:
• Competitive salary $120K-$180K
• Remote-first culture
• Equity package
• 401K matching`;

export default function JobMatchPage() {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId');

  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<StoredResume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeResume> | null>(null);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);

  useEffect(() => {
    const all = getResumes().filter(r => r.status === 'complete' && r.analysis);
    setResumes(all);
    if (resumeIdParam) {
      const found = getResumeById(resumeIdParam);
      if (found) setSelectedResume(found);
    } else if (all.length > 0) {
      setSelectedResume(all[0]);
    }
  }, [resumeIdParam]);

  const handleAnalyze = async () => {
    if (!selectedResume || !jobDescription.trim()) {
      toast.error('Please select a resume and enter a job description');
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const analysis = analyzeResume(selectedResume.rawText, jobDescription);
    setResult(analysis);
    setIsAnalyzing(false);
    toast.success(`Match score: ${analysis.matchScore}% 🎯`);
  };

  const getMatchColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Strong Match' };
    if (score >= 50) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Good Match' };
    if (score >= 30) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Partial Match' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Low Match' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Job Description Matcher</h1>
          <p className="text-gray-500 text-sm mt-1">
            Paste a job description to see how well your resume matches and what skills you're missing
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Resume Selector */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FileText size={14} className="inline mr-1.5" />
                Select Resume
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-300 transition-colors bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500" />
                    {selectedResume ? selectedResume.fileName : 'Select a resume...'}
                  </span>
                  <ChevronDown size={15} className="text-gray-400" />
                </button>
                <AnimatePresence>
                  {showResumeDropdown && resumes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden"
                    >
                      {resumes.map(r => {
                        const { color } = getScoreLabel(r.analysis?.atsScore ?? 0);
                        return (
                          <button
                            key={r.id}
                            onClick={() => { setSelectedResume(r); setShowResumeDropdown(false); setResult(null); }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0 ${r.id === selectedResume?.id ? 'bg-indigo-50' : ''}`}
                          >
                            <span className="text-gray-700 truncate text-left">{r.fileName}</span>
                            <span className={`font-bold flex-shrink-0 ml-2 ${color}`}>{r.analysis?.atsScore}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                {resumes.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    No analyzed resumes. <a href="/upload" className="text-indigo-600 hover:underline">Upload one first →</a>
                  </p>
                )}
              </div>
            </motion.div>

            {/* JD Input */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  <Briefcase size={14} className="inline mr-1.5" />
                  Job Description
                </label>
                <button
                  onClick={() => setJobDescription(SAMPLE_JD)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Info size={11} />
                  Load sample JD
                </button>
              </div>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here...

Include:
• Job requirements
• Required skills
• Preferred qualifications
• Responsibilities"
                className="w-full h-56 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{jobDescription.length} characters</span>
                {jobDescription && (
                  <button onClick={() => { setJobDescription(''); setResult(null); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </motion.div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedResume || !jobDescription.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Analyzing match...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Analyze Job Match
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div>
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    <Target size={28} className="text-indigo-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Match results will appear here</p>
                  <p className="text-sm text-gray-400 mt-2 max-w-xs">
                    Select a resume, paste a job description, then click Analyze to see your match score
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-indigo-100"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🎯</div>
                  </div>
                  <p className="text-gray-700 font-semibold">Comparing resume with job...</p>
                  <p className="text-gray-400 text-sm mt-1">Extracting requirements and matching skills</p>
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Match Score Hero */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6">
                      <ScoreCircle score={result.matchScore} size={100} strokeWidth={9} />
                      <div>
                        {(() => {
                          const mc = getMatchColor(result.matchScore);
                          return (
                            <>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${mc.bg} ${mc.text} ${mc.border}`}>
                                {mc.label}
                              </span>
                              <p className="text-xl font-extrabold text-gray-900 mt-2">
                                {result.matchScore}% Job Match
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {result.skillsFound.length} of your skills match this role
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Matched vs Missing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">Matched Skills</span>
                      </div>
                      <p className="text-2xl font-extrabold text-emerald-600">{result.skillsFound.length}</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle size={14} className="text-red-500" />
                        <span className="text-sm font-semibold text-red-600">Missing Skills</span>
                      </div>
                      <p className="text-2xl font-extrabold text-red-500">{result.missingSkills.length}</p>
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={14} className="text-indigo-500" />
                      <h3 className="text-sm font-semibold text-gray-800">Resume Score for This Job</h3>
                    </div>
                    <div className="space-y-3">
                      <ProgressBar label="Overall ATS Score" value={result.atsScore} delay={0.1} />
                      <ProgressBar label="Job Match Score" value={result.matchScore} color={getScoreColor(result.matchScore)} delay={0.2} />
                      <ProgressBar label="Keyword Alignment" value={result.keywordScore} delay={0.3} />
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {result.missingSkills.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle size={14} className="text-red-500" />
                        <h3 className="text-sm font-semibold text-gray-800">Missing Skills to Add</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map(skill => (
                          <SkillBadge key={skill} skill={skill} variant="missing" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {result.skillsFound.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <h3 className="text-sm font-semibold text-gray-800">Skills You Already Have</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.skillsFound.map(skill => (
                          <SkillBadge key={skill} skill={skill} variant="found" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Tips for This Job */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                    <h3 className="text-sm font-semibold text-indigo-800 mb-3">💡 Tips to Improve Your Match</h3>
                    <ul className="space-y-2">
                      {result.missingSkills.slice(0, 3).map(skill => (
                        <li key={skill} className="flex items-start gap-2 text-xs text-indigo-700">
                          <span className="text-indigo-400 mt-0.5">→</span>
                          Add <strong>{skill}</strong> to your skills section and mention it in your experience
                        </li>
                      ))}
                      <li className="flex items-start gap-2 text-xs text-indigo-700">
                        <span className="text-indigo-400 mt-0.5">→</span>
                        Tailor your summary to mention "{jobDescription.split(' ').slice(0, 5).join(' ')}..."
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
