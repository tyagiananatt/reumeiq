import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message = 'Analyzing...', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-indigo-100"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🧠</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-700 font-semibold">{message}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-16">{content}</div>;
}
