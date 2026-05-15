import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Target, TrendingUp, Plus, Lightbulb,
  BarChart2, Award, ArrowRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getResumes, deleteResume, StoredResume } from '../services/resumeStore';
import StatCard from '../components/StatCard';
import ResumeCard from '../components/ResumeCard';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';

const TIPS = [
  { icon: '🎯', tip: 'Mirror the job description keywords in your skills section', priority: 'High' },
  { icon: '📊', tip: 'Add 2-3 quantifiable achievements per role (e.g., "Increased sales by 32%")', priority: 'High' },
  { icon: '✍️', tip: 'Start bullet points with strong action verbs like "Led", "Built", "Improved"', priority: 'Medium' },
  { icon: '🔗', tip: 'Add your GitHub, LinkedIn, and portfolio links prominently', priority: 'Medium' },
  { icon: '📄', tip: 'Keep resume to 1 page if under 5 years experience, 2 pages max otherwise', priority: 'Low' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getResumes();
    setResumes(data);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteResume(id);
    setResumes(prev => prev.filter(r => r.id !== id));
    toast.success('Resume deleted');
  };

  const completed = resumes.filter(r => r.status === 'complete' && r.analysis);
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((a, r) => a + (r.analysis?.atsScore ?? 0), 0) / completed.length)
    : 0;
  const bestScore = completed.length > 0
    ? Math.max(...completed.map(r => r.analysis?.atsScore ?? 0))
    : 0;
  const totalSkills = completed.length > 0
    ? Math.max(...completed.map(r => r.analysis?.skillsFound.length ?? 0))
    : 0;

  // Radar data from best resume
  const bestResume = completed.find(r => r.analysis?.atsScore === bestScore);
  const radarData = bestResume?.analysis ? [
    { subject: 'Format', value: bestResume.analysis.formatScore },
    { subject: 'Keywords', value: bestResume.analysis.keywordScore },
    { subject: 'Experience', value: bestResume.analysis.experienceScore },
    { subject: 'Readability', value: bestResume.analysis.readabilityScore },
    { subject: 'ATS Score', value: bestResume.analysis.atsScore },
  ] : [];

  // Bar chart data
  const barData = completed.map((r, i) => ({
    name: `Resume ${i + 1}`,
    score: r.analysis?.atsScore ?? 0,
    label: r.fileName.split('_')[0],
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good morning, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's your resume performance overview
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all text-sm"
          >
            <Plus size={16} />
            Upload Resume
          </Link>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Resumes Analyzed"
            value={resumes.length}
            subtitle="All time"
            icon={<FileText size={20} />}
            color="#6366f1"
            delay={0}
            trend={{ value: 50, positive: true }}
          />
          <StatCard
            title="Average ATS Score"
            value={avgScore}
            subtitle="Across all resumes"
            icon={<Target size={20} />}
            color="#8b5cf6"
            delay={0.1}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Best Score"
            value={bestScore}
            subtitle="Your top resume"
            icon={<Award size={20} />}
            color="#10b981"
            delay={0.2}
          />
          <StatCard
            title="Skills Detected"
            value={totalSkills}
            subtitle="Unique technical skills"
            icon={<TrendingUp size={20} />}
            color="#f59e0b"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        {completed.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart */}
            {radarData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Resume Score Breakdown</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Best resume performance</p>
                  </div>
                  <BarChart2 size={18} className="text-gray-300" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Bar Chart */}
            {barData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">ATS Scores Comparison</h3>
                    <p className="text-xs text-gray-400 mt-0.5">All uploaded resumes</p>
                  </div>
                  <BarChart2 size={18} className="text-gray-300" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="score" name="ATS Score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resumes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">My Resumes</h2>
              <button
                onClick={() => setResumes(getResumes())}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-36 bg-white rounded-2xl shimmer border border-gray-100" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-indigo-400" />
                </div>
                <p className="text-gray-600 font-medium">No resumes yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload your first resume to get started</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  <Upload size={15} />
                  Upload Resume
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume, i) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onDelete={handleDelete}
                    delay={i * 0.1}
                  />
                ))}
                <Link
                  to="/upload"
                  className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm font-medium"
                >
                  <Plus size={16} />
                  Upload another resume
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Upload New Resume', to: '/upload', icon: Upload, color: 'bg-indigo-50 text-indigo-600' },
                  { label: 'View ATS Results', to: '/results', icon: Target, color: 'bg-purple-50 text-purple-600' },
                  { label: 'Job Description Match', to: '/job-match', icon: BarChart2, color: 'bg-emerald-50 text-emerald-600' },
                ].map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} flex-shrink-0`}>
                      <action.icon size={15} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-1">{action.label}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Pro Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-amber-500" />
                <h3 className="font-semibold text-gray-800">Resume Tips</h3>
              </div>
              <div className="space-y-3">
                {TIPS.slice(0, 4).map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                    <span className="text-lg flex-shrink-0">{tip.icon}</span>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">{tip.tip}</p>
                      <span className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        tip.priority === 'High' ? 'bg-red-100 text-red-600' :
                        tip.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {tip.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* DevOps Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white"
            >
              <p className="text-xs text-indigo-200 font-medium mb-2">🛠️ DevOps Stack</p>
              <p className="text-sm font-bold mb-3">Production-Ready Infrastructure</p>
              <div className="flex flex-wrap gap-1.5">
                {['Docker', 'GitHub Actions', 'Nginx', 'PostgreSQL', 'JWT', 'CI/CD'].map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
