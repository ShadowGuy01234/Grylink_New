import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const statusColors: Record<string, string> = {
    // Company/General
    LEAD_CREATED: 'badge-yellow',
    CREDENTIALS_CREATED: 'badge-blue',
    DOCS_SUBMITTED: 'badge-purple',
    ACTION_REQUIRED: 'badge-red',
    ACTIVE: 'badge-green',
    PENDING: 'badge-yellow',
    
    // Sub-contractor
    PROFILE_INCOMPLETE: 'badge-yellow',
    PROFILE_COMPLETED: 'badge-green',
    
    // Bills
    UPLOADED: 'badge-yellow',
    VERIFIED: 'badge-green',
    REJECTED: 'badge-red',
    
    // Cases
    READY_FOR_COMPANY_REVIEW: 'badge-purple',
    EPC_REJECTED: 'badge-red',
    EPC_VERIFIED: 'badge-green',
    BID_PLACED: 'badge-blue',
    NEGOTIATION_IN_PROGRESS: 'badge-purple',
    COMMERCIAL_LOCKED: 'badge-green',
    
    // Bids
    SUBMITTED: 'badge-blue',
    ACCEPTED: 'badge-green',
    
    // KYC
    KYC_REQUIRED: 'badge-yellow',
    KYC_IN_PROGRESS: 'badge-blue',
    KYC_COMPLETED: 'badge-green',
  };

  const colorClass = statusColors[status] || 'badge-gray';
  const displayText = status.replace(/_/g, ' ');

  return <span className={`badge ${colorClass} ${className}`}>{displayText}</span>;
};

export default Badge;
