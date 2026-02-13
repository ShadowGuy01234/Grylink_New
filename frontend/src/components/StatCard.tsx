import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  onClick 
}) => {
  const variantClasses = {
    default: '',
    success: 'stat-success',
    warning: 'stat-warning',
    danger: 'stat-danger',
    info: 'stat-info',
  };

  return (
    <div 
      className={`stat-card ${variantClasses[variant]} ${onClick ? 'stat-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-content">
        <div className="stat-header">
          <p className="stat-title">{title}</p>
          {icon && <div className="stat-icon">{icon}</div>}
        </div>
        <div className="stat-value-row">
          <h3 className="stat-value">{value}</h3>
          {trend && (
            <span className={`stat-trend ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
