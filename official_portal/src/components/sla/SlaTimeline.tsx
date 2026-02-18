import { motion } from 'framer-motion';
import { HiCheck, HiExclamation, HiClock, HiX } from 'react-icons/hi';

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'skipped';
  targetDate?: string;
  completedAt?: string;
  assignee?: string;
}

interface SlaTimelineProps {
  steps: TimelineStep[];
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
  showDates?: boolean;
  compact?: boolean;
}

export const SlaTimeline = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  showDates = true,
  compact = false,
}: SlaTimelineProps) => {
  const getStatusIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <HiCheck />;
      case 'overdue':
        return <HiExclamation />;
      case 'in-progress':
        return <HiClock />;
      case 'skipped':
        return <HiX />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: TimelineStep['status'], isCurrentStep: boolean) => {
    if (isCurrentStep && status === 'pending') return 'current';
    return status;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: orientation === 'horizontal' ? 20 : 0, x: orientation === 'vertical' ? -20 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <motion.div
      className={`sla-timeline ${orientation} ${compact ? 'compact' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {steps.map((step, index) => {
        const isCurrentStep = currentStep !== undefined ? index === currentStep : step.status === 'in-progress';
        const statusClass = getStatusClass(step.status, isCurrentStep);

        return (
          <motion.div
            key={step.id}
            className={`timeline-step ${statusClass}`}
            variants={itemVariants}
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`timeline-connector ${steps[index + 1].status === 'completed' || step.status === 'completed' ? 'filled' : ''}`} />
            )}

            {/* Step Marker */}
            <div className={`timeline-marker ${statusClass}`}>
              {getStatusIcon(step.status) || (
                <span className="step-number">{index + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="timeline-content">
              <span className="step-label">{step.label}</span>
              {!compact && step.description && (
                <span className="step-description">{step.description}</span>
              )}
              {showDates && (
                <div className="step-dates">
                  {step.completedAt ? (
                    <span className="completed-date">
                      Completed {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  ) : step.targetDate ? (
                    <span className={`target-date ${step.status === 'overdue' ? 'overdue' : ''}`}>
                      Due {new Date(step.targetDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              )}
              {!compact && step.assignee && (
                <span className="step-assignee">
                  Assigned: {step.assignee}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Pre-configured timeline for standard Gryork case flow
export const GryorkCaseTimeline = ({ 
  caseData 
}: { 
  caseData: {
    currentStage: string;
    milestones?: {
      [key: string]: { completedAt?: string; targetDate?: string };
    };
  };
}) => {
  const stageOrder = [
    { id: 'kyc', label: 'KYC Verification', description: 'Identity & document verification' },
    { id: 'epc', label: 'EPC Approval', description: 'EPC company verification' },
    { id: 'bill', label: 'Bill Verification', description: 'Invoice & supporting docs' },
    { id: 'nbfc', label: 'NBFC Review', description: 'Financial partner approval' },
    { id: 'disbursement', label: 'Disbursement', description: 'Funds transfer' },
    { id: 'repayment', label: 'Repayment', description: 'Collection complete' },
  ];

  const currentStageIndex = stageOrder.findIndex(s => s.id === caseData.currentStage.toLowerCase());

  const steps: TimelineStep[] = stageOrder.map((stage, index) => {
    const milestone = caseData.milestones?.[stage.id];
    let status: TimelineStep['status'] = 'pending';

    if (index < currentStageIndex) {
      status = 'completed';
    } else if (index === currentStageIndex) {
      status = 'in-progress';
    }

    // Check for overdue
    if (milestone?.targetDate && !milestone?.completedAt) {
      const target = new Date(milestone.targetDate);
      if (target < new Date()) {
        status = 'overdue';
      }
    }

    return {
      ...stage,
      status,
      targetDate: milestone?.targetDate,
      completedAt: milestone?.completedAt,
    };
  });

  return <SlaTimeline steps={steps} currentStep={currentStageIndex} />;
};

export default SlaTimeline;
