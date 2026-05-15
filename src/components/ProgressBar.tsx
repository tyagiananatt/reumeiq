import { motion } from 'framer-motion';
import { getScoreColor } from '../services/atsAnalyzer';

interface ProgressBarProps {
  label: string;
  value: number;
  showValue?: boolean;
  color?: string;
  delay?: number;
  height?: number;
}

export default function ProgressBar({
  label,
  value,
  showValue = true,
  color,
  delay = 0,
  height = 8,
}: ProgressBarProps) {
  const barColor = color || getScoreColor(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-sm font-bold" style={{ color: barColor }}>
            {value}%
          </span>
        )}
      </div>
      <div className="bg-gray-100 rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className="rounded-full"
          style={{ height, backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}
