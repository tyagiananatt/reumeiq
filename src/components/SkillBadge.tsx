interface SkillBadgeProps {
  skill: string;
  variant?: 'found' | 'missing' | 'neutral';
  size?: 'sm' | 'md';
}

export default function SkillBadge({ skill, variant = 'neutral', size = 'sm' }: SkillBadgeProps) {
  const styles = {
    found: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    missing: 'bg-red-50 text-red-600 border-red-200',
    neutral: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-lg border font-medium ${styles[variant]} ${sizes[size]}`}>
      {variant === 'found' && <span className="mr-1.5 text-emerald-500">✓</span>}
      {variant === 'missing' && <span className="mr-1.5 text-red-400">✗</span>}
      {skill}
    </span>
  );
}
