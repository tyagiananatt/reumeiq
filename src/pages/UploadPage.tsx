import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, X, CheckCircle, AlertCircle,
  Zap, Shield, Clock
} from 'lucide-react';
import { analyzeResume } from '../services/atsAnalyzer';
import { saveResume } from '../services/resumeStore';
import toast from 'react-hot-toast';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type Step = 'upload' | 'parsing' | 'analyzing' | 'done';

const ANALYSIS_STEPS = [
  { id: 'parsing', label: 'Parsing document structure...', icon: '📄' },
  { id: 'extracting', label: 'Extracting skills & keywords...', icon: '🔍' },
  { id: 'scoring', label: 'Calculating ATS score...', icon: '📊' },
  { id: 'suggestions', label: 'Generating improvement tips...', icon: '💡' },
  { id: 'done', label: 'Analysis complete!', icon: '✅' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>('upload');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted: File[], rejected: { file: File; errors: readonly { message: string; code: string }[] }[]) => {
    if (rejected.length > 0) {
      const msg = rejected[0]?.errors[0]?.message ?? 'Invalid file';
      setError(msg.includes('size') ? 'File too large. Max size is 5MB.' : 'Only PDF, DOCX, or TXT files are accepted.');
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setStep('parsing');

    // Read file
    const text = await readFileAsText(file);

    setStep('analyzing');

    // Simulate step-by-step analysis
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentStep(i);
      setAnalysisProgress(Math.round(((i + 1) / ANALYSIS_STEPS.length) * 100));
      await sleep(600 + Math.random() * 400);
    }

    // Run analysis
    const result = analyzeResume(text);

    // Save to store
    const resumeId = `resume-${Date.now()}`;
    saveResume({
      id: resumeId,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      rawText: text,
      analysis: result,
      status: 'complete',
    });

    setStep('done');
    toast.success(`Analysis complete! ATS Score: ${result.atsScore}/100 🎉`);

    await sleep(1000);
    navigate(`/results?id=${resumeId}`);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
          <p className="text-gray-500 text-sm mt-1">Upload your resume to get your ATS score and improvement suggestions</p>
        </motion.div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`upload-area rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive ? 'active' : ''
                } ${file ? 'border-emerald-300 bg-emerald-50' : ''}`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <FileText size={28} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700">{file.name}</p>
                      <p className="text-sm text-emerald-600">{formatSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <X size={12} />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ y: isDragActive ? -8 : 0 }}
                      className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center"
                    >
                      <Upload size={28} className="text-indigo-500" />
                    </motion.div>
                    <div>
                      <p className="text-gray-700 font-semibold text-lg">
                        {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        PDF, DOCX, TXT
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Shield size={12} />
                        Max 5MB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  <AlertCircle size={15} />
                  {error}
                </motion.div>
              )}

              {/* Features row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Zap, label: 'Instant Analysis', desc: 'Results in seconds', color: '#6366f1' },
                  { icon: Shield, label: 'Private & Secure', desc: 'Your data is safe', color: '#10b981' },
                  { icon: Clock, label: 'Save History', desc: 'Track your progress', color: '#f59e0b' },
                ].map(f => (
                  <div key={f.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-sm">
                    <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${f.color}15` }}>
                      <f.icon size={16} style={{ color: f.color }} />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{f.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Analyze Button */}
              {file && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={20} />
                  Analyze My Resume
                </motion.button>
              )}

              {/* Demo option */}
              {!file && (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">No resume handy?</p>
                  <button
                    onClick={() => {
                      const demoText = `John Doe
john@email.com | +1 555-0100 | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

SUMMARY
Senior Software Engineer with 6+ years building scalable web applications. Specializing in React, Node.js, and cloud-native architectures. Led teams of 8 engineers and delivered products serving 500K+ users.

EXPERIENCE
Senior Software Engineer — Acme Corp | 2020 - Present
• Architected microservices platform serving 500K+ daily users using Node.js and Docker
• Reduced API response time by 65% through Redis caching and database optimization
• Implemented CI/CD pipeline with GitHub Actions, cutting deployment time by 70%
• Mentored team of 5 junior engineers, improving code review turnaround by 40%

Software Engineer — TechStart | 2018 - 2020
• Built real-time dashboard using React and WebSockets with 99.9% uptime
• Developed RESTful APIs using Express.js and PostgreSQL
• Containerized application using Docker and deployed to AWS

EDUCATION
B.S. Computer Science — State University | 2014-2018 | GPA: 3.7

SKILLS
JavaScript, TypeScript, React, Node.js, Express, Python, Docker, Kubernetes, AWS, GCP, PostgreSQL, MongoDB, Redis, Git, GitHub Actions, CI/CD, REST API, GraphQL, Microservices, Agile, Linux, Nginx, Terraform

CERTIFICATIONS
• AWS Certified Developer — Associate (2023)
• Certified Kubernetes Application Developer (2022)
• Docker Certified Associate (2021)`;

                      const demoFile = new File([demoText], 'John_Doe_Resume.txt', { type: 'text/plain' });
                      setFile(demoFile);
                      toast.success('Demo resume loaded!');
                    }}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700 underline decoration-dotted"
                  >
                    Use demo resume →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {(step === 'parsing' || step === 'analyzing') && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center"
            >
              {/* Animated brain */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-indigo-100"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🧠
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">Analyzing Your Resume</h2>
              <p className="text-gray-500 text-sm mb-8">Our AI engine is processing your document...</p>

              {/* Progress */}
              <div className="max-w-sm mx-auto mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="text-indigo-600 font-bold">{analysisProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2 text-left max-w-sm mx-auto">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    i < currentStep ? 'opacity-50' :
                    i === currentStep ? 'bg-indigo-50' : 'opacity-30'
                  }`}>
                    <span className="text-base">{s.icon}</span>
                    <span className={`text-sm ${i === currentStep ? 'text-indigo-700 font-medium' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                    {i < currentStep && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
                    {i === currentStep && (
                      <div className="ml-auto w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Analysis Complete!</h2>
              <p className="text-gray-500 text-sm mt-2">Redirecting to your results...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string ?? '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
