import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { StoredResume } from '../services/resumeStore';
import { getScoreLabel, getScoreColor } from '../services/atsAnalyzer';
import { format } from 'date-fns';

interface ResumeCardProps {
  resume: StoredResume;
  onDelete: (id: string) => void;
  delay?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeCard({ resume, onDelete, delay = 0 }: ResumeCardProps) {
  const score = resume.analysis?.atsScore ?? 0;
  const scoreColor = getScoreColor(score);
  const { label } = getScoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      {/* Score bar on top */}
      <div
        className="h-1 transition-all"
        style={{
          background: resume.status === 'complete'
            ? `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`
            : '#e2e8f0',
          width: resume.status === 'complete' ? `${score}%` : '100%',
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* File info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{resume.fileName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{formatSize(resume.fileSize)}</span>
                <span className="text-gray-200">•</span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={10} />
                  {format(new Date(resume.uploadDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          {resume.status === 'complete' && resume.analysis && (
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
              <span className="text-[10px] font-medium" style={{ color: scoreColor }}>{label}</span>
            </div>
          )}

          {resume.status === 'analyzing' && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Analyzing</span>
            </div>
          )}
        </div>

        {/* Sections */}
        {resume.analysis && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Object.entries(resume.analysis.sections).map(([key, val]) => (
              val ? (
                <span key={key} className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                  <CheckCircle size={9} />
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ) : (
                <span key={key} className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                  <AlertCircle size={9} />
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to={`/results?id=${resume.id}`}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Eye size={13} />
              View Analysis
            </Link>
            <Link
              to={`/job-match?resumeId=${resume.id}`}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Match Jobs
            </Link>
          </div>
          <button
            onClick={() => onDelete(resume.id)}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
