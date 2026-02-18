import { motion } from 'framer-motion';
import { HiCheck, HiExclamation, HiClock, HiOutlineCalendar } from 'react-icons/hi';
import { SlaProgressRing } from './SlaProgressRing';

export interface Milestone {
  name: string;
  day: number;
  targetDate: string;
  status: 'PENDING' | 'COMPLETED' | 'COMPLETED_LATE' | 'OVERDUE';
  completedAt?: string;
  completedBy?: string;
  description?: string;
}

interface SlaMilestoneTrackerProps {
  milestones: Milestone[];
  caseNumber?: string;
  createdAt: string;
  showProgress?: boolean;
}

export const SlaMilestoneTracker = ({
  milestones,
  caseNumber,
  createdAt,
  showProgress = true,
}: SlaMilestoneTrackerProps) => {
  // Calculate overall progress
  const completedCount = milestones.filter(m => 
    m.status === 'COMPLETED' || m.status === 'COMPLETED_LATE'
  ).length;
  const progress = (completedCount / milestones.length) * 100;

  // Determine overall status
  const hasOverdue = milestones.some(m => m.status === 'OVERDUE');
  const hasLate = milestones.some(m => m.status === 'COMPLETED_LATE');
  const allCompleted = completedCount === milestones.length;

  let overallStatus: 'on-track' | 'warning' | 'critical' | 'breached' | 'completed' = 'on-track';
  if (allCompleted) overallStatus = 'completed';
  else if (hasOverdue) overallStatus = 'breached';
  else if (hasLate) overallStatus = 'warning';

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <HiCheck className="text-green-500" />;
      case 'COMPLETED_LATE':
        return <HiCheck className="text-amber-500" />;
      case 'OVERDUE':
        return <HiExclamation className="text-red-500" />;
      default:
        return <HiClock className="text-gray-400" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDaysUntil = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    return `${diff}d left`;
  };

  return (
    <motion.div 
      className="sla-milestone-tracker"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header with Progress */}
      <div className="milestone-header">
        <div className="milestone-info">
          {caseNumber && (
            <span className="case-number">Case #{caseNumber}</span>
          )}
          <span className="created-date">
            <HiOutlineCalendar />
            Started {formatDate(createdAt)}
          </span>
        </div>
        {showProgress && (
          <SlaProgressRing
            progress={progress}
            size={80}
            strokeWidth={6}
            status={overallStatus}
            showPercentage={true}
            label=""
          />
        )}
      </div>

      {/* Milestone Cards */}
      <div className="milestone-grid">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.name}
            className={`milestone-card ${milestone.status.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="milestone-day">
              <span className="day-number">Day {milestone.day}</span>
              <span className="day-label">{milestone.name}</span>
            </div>

            <div className="milestone-status">
              <div className={`status-indicator ${milestone.status.toLowerCase()}`}>
                {getStatusIcon(milestone.status)}
              </div>
              <span className="status-text">
                {milestone.status === 'COMPLETED' && 'Completed'}
                {milestone.status === 'COMPLETED_LATE' && 'Completed Late'}
                {milestone.status === 'OVERDUE' && 'Overdue'}
                {milestone.status === 'PENDING' && getDaysUntil(milestone.targetDate)}
              </span>
            </div>

            <div className="milestone-dates">
              <div className="date-row">
                <span className="date-label">Target:</span>
                <span className="date-value">{formatDate(milestone.targetDate)}</span>
              </div>
              {milestone.completedAt && (
                <div className="date-row">
                  <span className="date-label">Actual:</span>
                  <span className="date-value">{formatDate(milestone.completedAt)}</span>
                </div>
              )}
            </div>

            {milestone.completedBy && (
              <div className="milestone-assignee">
                <span>By: {milestone.completedBy}</span>
              </div>
            )}

            {/* Progress bar under card */}
            <div className="milestone-progress-bar">
              <motion.div 
                className={`progress-fill ${milestone.status.toLowerCase()}`}
                initial={{ width: 0 }}
                animate={{ 
                  width: milestone.status === 'PENDING' ? '0%' : '100%' 
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="milestone-legend">
        <div className="legend-item">
          <span className="legend-dot completed" />
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot completed_late" />
          <span>Completed Late</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot pending" />
          <span>Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot overdue" />
          <span>Overdue</span>
        </div>
      </div>
    </motion.div>
  );
};

// Standard Gryork Day Milestones (Day 3, 7, 10, 14)
export const GryorkMilestoneTracker = ({ 
  slaData 
}: { 
  slaData: {
    caseNumber?: string;
    createdAt: string;
    milestones: {
      day3: { name: string; targetDate: string; status: string; completedAt?: string; completedBy?: string };
      day7: { name: string; targetDate: string; status: string; completedAt?: string; completedBy?: string };
      day10: { name: string; targetDate: string; status: string; completedAt?: string; completedBy?: string };
      day14: { name: string; targetDate: string; status: string; completedAt?: string; completedBy?: string };
    };
  };
}) => {
  const milestones: Milestone[] = [
    { ...slaData.milestones.day3, day: 3, status: slaData.milestones.day3.status as Milestone['status'] },
    { ...slaData.milestones.day7, day: 7, status: slaData.milestones.day7.status as Milestone['status'] },
    { ...slaData.milestones.day10, day: 10, status: slaData.milestones.day10.status as Milestone['status'] },
    { ...slaData.milestones.day14, day: 14, status: slaData.milestones.day14.status as Milestone['status'] },
  ];

  return (
    <SlaMilestoneTracker
      milestones={milestones}
      caseNumber={slaData.caseNumber}
      createdAt={slaData.createdAt}
    />
  );
};

export default SlaMilestoneTracker;
