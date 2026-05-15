import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Target, Zap, TrendingUp, Shield,
  CheckCircle, ArrowRight, Star, BarChart2, Brain, Upload
} from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced keyword extraction and ATS scoring engine analyzes your resume in seconds.', color: '#6366f1' },
  { icon: Target, title: 'ATS Score', desc: 'Get a precise ATS compatibility score with detailed breakdown across 5 key dimensions.', color: '#8b5cf6' },
  { icon: Zap, title: 'Job Description Match', desc: 'Paste any job description and instantly see your match percentage and missing skills.', color: '#06b6d4' },
  { icon: TrendingUp, title: 'Improvement Tips', desc: 'Personalized, actionable suggestions to boost your resume score and interview chances.', color: '#10b981' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track all your resumes, scores, and improvements over time in one place.', color: '#f59e0b' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your resume data is encrypted and never shared. Built with enterprise-grade security.', color: '#ef4444' },
];

const STATS = [
  { value: '50K+', label: 'Resumes Analyzed' },
  { value: '3x', label: 'More Interviews' },
  { value: '94%', label: 'User Satisfaction' },
  { value: '200+', label: 'Companies Hiring' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', role: 'Software Engineer @ Google', avatar: 'SC',
    text: 'ResumeIQ helped me identify missing keywords and I got 3x more callbacks. Landed my dream job at Google!',
    score: 92,
  },
  {
    name: 'Marcus Rivera', role: 'Product Manager @ Stripe', avatar: 'MR',
    text: 'The ATS score feature is incredibly accurate. Went from 0 callbacks to 8 interviews in 2 weeks.',
    score: 88,
  },
  {
    name: 'Priya Sharma', role: 'Data Scientist @ Netflix', avatar: 'PS',
    text: 'The job description matcher showed me exactly what was missing. Boosted my resume score from 54 to 91!',
    score: 91,
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume. Our parser extracts all information instantly.', icon: Upload },
  { step: '02', title: 'Get ATS Score', desc: 'Our engine analyzes keywords, formatting, sections, and generates your ATS score.', icon: Target },
  { step: '03', title: 'Match Jobs', desc: 'Paste a job description to see match percentage and discover missing skills.', icon: Zap },
  { step: '04', title: 'Improve & Apply', desc: 'Follow personalized tips to boost your score and land more interviews.', icon: TrendingUp },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              Resume<span className="text-indigo-600">IQ</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all shadow-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <Zap size={14} />
              AI-Powered Resume Intelligence
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Beat ATS Filters.
              <br />
              <span className="gradient-text">Land More Interviews.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              ResumeIQ analyzes your resume with AI, generates an ATS score,
              matches you with job descriptions, and provides actionable improvements —
              all in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              Analyze My Resume Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              View Demo Dashboard
            </Link>
          </motion.div>

          {/* Hero badge row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500"
          >
            {['No credit card required', 'Free forever plan', 'Instant results', 'GDPR compliant'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                {item}
              </span>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative mx-auto max-w-4xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-xs text-gray-400">resumeiq.app/dashboard</span>
              </div>
              {/* Mock content */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'ATS Score', val: '87', color: '#10b981' },
                    { label: 'Match %', val: '74%', color: '#6366f1' },
                    { label: 'Skills Found', val: '18', color: '#8b5cf6' },
                    { label: 'Missing', val: '3', color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Score Breakdown</p>
                    {['Format Score', 'Keyword Score', 'Experience', 'Readability'].map((item, i) => (
                      <div key={item} className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{item}</span>
                          <span className="font-medium text-gray-700">{[95, 88, 85, 92][i]}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-1.5 bg-indigo-500 rounded-full"
                            style={{ width: `${[95, 88, 85, 92][i]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Skills Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Node.js', 'Docker', 'AWS', 'Python', 'PostgreSQL', 'CI/CD', 'TypeScript'].map(s => (
                        <span key={s} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">✓ {s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-extrabold text-white">{s.value}</p>
                <p className="text-indigo-200 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How ResumeIQ Works</h2>
            <p className="text-gray-500 mt-3 text-lg">Get your ATS score in under 30 seconds</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
                    <step.icon size={28} className="text-indigo-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-gray-800 text-lg">{step.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 mt-3 text-lg">Powerful features to supercharge your job search</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}15` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{f.title}</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Loved by Job Seekers</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
              <span className="ml-2 text-gray-500 text-sm">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {t.score}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              Ready to Beat the ATS?
            </h2>
            <p className="mt-4 text-indigo-200 text-xl">
              Join 50,000+ professionals who landed their dream jobs with ResumeIQ.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-xl"
              >
                Start Free Analysis →
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-indigo-500/40 text-white font-semibold rounded-xl hover:bg-indigo-500/60 border border-indigo-400 transition-all"
              >
                Sign in to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <FileText size={14} className="text-white" />
              </div>
              <span className="text-white font-bold">ResumeIQ</span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 ResumeIQ. Built with ❤️ for job seekers worldwide.</p>
            <div className="flex items-center gap-4">
              {['Privacy', 'Terms', 'Contact'].map(link => (
                <a key={link} href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-wrap justify-center gap-3">
            {['Docker', 'GitHub Actions', 'CI/CD', 'PostgreSQL', 'Node.js', 'React', 'Nginx'].map(t => (
              <span key={t} className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700">{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
