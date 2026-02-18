import { motion } from 'framer-motion';

interface SlaProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  status?: 'on-track' | 'warning' | 'critical' | 'breached' | 'completed';
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const SlaProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  status = 'on-track',
  label,
  sublabel,
  showPercentage = true,
  animated = true,
}: SlaProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const statusColors = {
    'on-track': { stroke: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
    'warning': { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    'critical': { stroke: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'breached': { stroke: '#DC2626', bg: 'rgba(220, 38, 38, 0.15)' },
    'completed': { stroke: '#1E5AAF', bg: 'rgba(30, 90, 175, 0.1)' },
  };

  const colors = statusColors[status];

  return (
    <div className="sla-progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      <div className="progress-ring-content">
        {showPercentage && (
          <motion.span 
            className="progress-percentage"
            initial={animated ? { opacity: 0, scale: 0.5 } : { opacity: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ color: colors.stroke }}
          >
            {Math.round(progress)}%
          </motion.span>
        )}
        {label && <span className="progress-label">{label}</span>}
        {sublabel && <span className="progress-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
};

export default SlaProgressRing;
