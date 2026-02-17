import { HiOutlinePhone, HiOutlineMail, HiOutlineOfficeBuilding, HiOutlineChevronRight } from 'react-icons/hi';
import type { BaseEntity } from './types';
import { getStatusConfig } from './types';
import StatusBadge from './StatusBadge';

interface EntityCardProps {
  entity: BaseEntity;
  isSelected?: boolean;
  onClick?: () => void;
  showStatus?: boolean;
  showCompany?: boolean;
  subtitle?: string;
}

export const EntityCard = ({
  entity,
  isSelected = false,
  onClick,
  showStatus = true,
  showCompany = true,
  subtitle,
}: EntityCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusConfig = entity.status ? getStatusConfig(entity.status) : null;

  return (
    <div
      className={`entity-card ${isSelected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="entity-avatar" style={{ background: statusConfig?.bgColor || '#e5e7eb' }}>
        {getInitials(entity.name || 'NA')}
      </div>

      <div className="entity-info">
        <div className="entity-name">{entity.name || 'Unknown'}</div>
        
        {subtitle && <div className="entity-subtitle">{subtitle}</div>}
        
        {showCompany && entity.company && (
          <div className="entity-company">
            <HiOutlineOfficeBuilding />
            <span>{typeof entity.company === 'string' ? entity.company : entity.company.companyName}</span>
          </div>
        )}

        <div className="entity-contacts">
          {entity.email && (
            <span className="contact-item">
              <HiOutlineMail />
              {entity.email}
            </span>
          )}
          {entity.phone && (
            <span className="contact-item">
              <HiOutlinePhone />
              {entity.phone}
            </span>
          )}
        </div>

        {showStatus && entity.status && (
          <div className="entity-status">
            <StatusBadge status={entity.status} size="sm" />
          </div>
        )}
      </div>

      {onClick && (
        <div className="entity-arrow">
          <HiOutlineChevronRight />
        </div>
      )}

      <style>{`
        .entity-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: all 0.15s ease;
        }

        .entity-card.clickable {
          cursor: pointer;
        }

        .entity-card.clickable:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .entity-card.selected {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .entity-avatar {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .entity-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .entity-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .entity-subtitle {
          font-size: 12px;
          color: #6b7280;
        }

        .entity-company {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .entity-company svg {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }

        .entity-company span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .entity-contacts {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 4px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #9ca3af;
        }

        .contact-item svg {
          flex-shrink: 0;
          width: 12px;
          height: 12px;
        }

        .entity-status {
          margin-top: 6px;
        }

        .entity-arrow {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: transform 0.15s;
        }

        .entity-card.clickable:hover .entity-arrow {
          transform: translateX(2px);
          color: #6b7280;
        }

        .entity-card.selected .entity-arrow {
          color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default EntityCard;
