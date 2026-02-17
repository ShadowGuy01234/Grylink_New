// Shared types for verification components

export interface BaseDocument {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'missing';
  uploadedAt?: string;
  verifiedBy?: { _id: string; name: string } | string;
  verifiedAt?: string;
  verificationNotes?: string;
  thumbnailUrl?: string;
}

export interface BaseEntity {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  company?: { _id: string; companyName: string } | string;
}

export interface VerificationDecision {
  decision: 'approve' | 'reject';
  notes?: string;
}

export interface DocumentType {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  description?: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  pending: {
    label: 'Pending Review',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  verified: {
    label: 'Verified',
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  missing: {
    label: 'Not Uploaded',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  DOCUMENTS_PENDING: {
    label: 'Documents Pending',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
};

export const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
};
