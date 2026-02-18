import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineClock, 
  HiOutlineExclamation, 
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export interface PipelineItem {
  _id: string;
  caseNumber?: string;
  entityName: string;
  entityType: 'subcontractor' | 'epc' | 'case' | 'bill';
  companyName?: string;
  amount?: number;
  assignee?: { name: string; _id: string };
  deadline: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentMilestone?: string;
}

type ColumnType = 'on-track' | 'attention' | 'critical' | 'breached' | 'completed';

interface SlaPipelineKanbanProps {
  items: PipelineItem[];
  onItemClick?: (item: PipelineItem) => void;
  onItemMove?: (item: PipelineItem, newStatus: ColumnType) => void;
  showCounts?: boolean;
}

export const SlaPipelineKanban = ({
  items,
  onItemClick,
  showCounts = true,
}: SlaPipelineKanbanProps) => {
  const [hoveredColumn, setHoveredColumn] = useState<ColumnType | null>(null);

  // Categorize items by time remaining
  const categorizeItem = (item: PipelineItem): ColumnType => {
    const now = new Date().getTime();
    const target = new Date(item.deadline).getTime();
    const diff = target - now;
    const hours = diff / (1000 * 60 * 60);

    if (diff < 0) return 'breached';
    if (hours < 2) return 'critical';
    if (hours < 8) return 'attention';
    return 'on-track';
  };

  const columns: { id: ColumnType; label: string; icon: typeof HiOutlineClock; color: string }[] = [
    { id: 'on-track', label: 'On Track', icon: HiOutlineCheckCircle, color: '#22C55E' },
    { id: 'attention', label: 'Needs Attention', icon: HiOutlineClock, color: '#F59E0B' },
    { id: 'critical', label: 'Critical', icon: HiOutlineExclamation, color: '#EF4444' },
    { id: 'breached', label: 'Breached', icon: HiOutlineExclamation, color: '#DC2626' },
  ];

  const getColumnItems = (columnId: ColumnType) => 
    items.filter(item => categorizeItem(item) === columnId);

  const getTimeDisplay = (deadline: string) => {
    const now = new Date().getTime();
    const target = new Date(deadline).getTime();
    const diff = target - now;
    
    if (diff < 0) {
      const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      return `${hours}h overdue`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return null;
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  return (
    <div className="sla-pipeline-kanban">
      <div className="kanban-columns">
        {columns.map(column => {
          const columnItems = getColumnItems(column.id);
          const Icon = column.icon;
          
          return (
            <motion.div
              key={column.id}
              className={`kanban-column ${column.id} ${hoveredColumn === column.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredColumn(column.id)}
              onMouseLeave={() => setHoveredColumn(null)}
            >
              {/* Column Header */}
              <div className="column-header" style={{ borderLeftColor: column.color }}>
                <div className="header-title">
                  <Icon style={{ color: column.color }} />
                  <span>{column.label}</span>
                </div>
                {showCounts && (
                  <span className="item-count" style={{ background: `${column.color}20`, color: column.color }}>
                    {columnItems.length}
                  </span>
                )}
              </div>

              {/* Column Items */}
              <div className="column-content">
                <AnimatePresence>
                  {columnItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      className={`kanban-card priority-${item.priority}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onItemClick?.(item)}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                    >
                      {/* Card Header */}
                      <div className="card-header">
                        <span className="entity-type">
                          {item.entityType === 'epc' && <HiOutlineOfficeBuilding />}
                          {item.entityType === 'subcontractor' && <HiOutlineUser />}
                          {item.caseNumber && `#${item.caseNumber}`}
                        </span>
                        <span className={`priority-badge ${item.priority}`}>
                          {item.priority}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="card-body">
                        <h4 className="entity-name">{item.entityName}</h4>
                        {item.companyName && (
                          <span className="company-name">{item.companyName}</span>
                        )}
                        {item.amount && (
                          <span className="amount-badge">
                            {formatCurrency(item.amount)}
                          </span>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="card-footer">
                        <div className={`time-remaining ${categorizeItem(item)}`}>
                          <HiOutlineClock />
                          <span>{getTimeDisplay(item.deadline)}</span>
                        </div>
                        {item.assignee && (
                          <div className="assignee">
                            <span className="assignee-avatar">
                              {item.assignee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress indicator */}
                      {item.currentMilestone && (
                        <div className="milestone-indicator">
                          <HiOutlineArrowRight />
                          <span>{item.currentMilestone}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {columnItems.length === 0 && (
                  <div className="empty-column">
                    <Icon style={{ color: column.color, opacity: 0.3 }} />
                    <span>No items</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SlaPipelineKanban;
