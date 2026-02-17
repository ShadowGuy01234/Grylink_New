const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Tracks all user actions across the platform for compliance and debugging
 */
const auditLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    userName: { type: String },
    userRole: { 
      type: String, 
      enum: ['sales', 'epc', 'subcontractor', 'ops', 'rmt', 'nbfc', 'founder', 'admin', 'system'],
    },
    userEmail: { type: String },

    // Action details
    action: {
      type: String,
      enum: [
        // Auth actions
        'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
        // Document actions
        'DOCUMENT_UPLOAD', 'DOCUMENT_VIEW', 'DOCUMENT_VERIFY', 'DOCUMENT_REJECT',
        // Company/KYC actions
        'COMPANY_CREATE', 'COMPANY_UPDATE', 'COMPANY_VERIFY', 'COMPANY_REJECT',
        'KYC_REQUEST', 'KYC_SUBMIT', 'KYC_VERIFY', 'KYC_REJECT', 'KYC_COMPLETE',
        // Bill actions
        'BILL_CREATE', 'BILL_SUBMIT', 'BILL_VERIFY', 'BILL_REJECT',
        // Case actions
        'CASE_CREATE', 'CASE_UPDATE', 'CASE_STATUS_CHANGE', 'CASE_CLOSE',
        // Bid actions
        'BID_CREATE', 'BID_UPDATE', 'BID_ACCEPT', 'BID_REJECT',
        // Transaction actions
        'TRANSACTION_CREATE', 'TRANSACTION_UPDATE', 'DISBURSEMENT', 'REPAYMENT',
        // NBFC actions
        'NBFC_INVITE', 'NBFC_SHARE_CASE', 'NBFC_QUOTE_SUBMIT',
        // Admin actions
        'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_ACTIVATE', 'USER_DEACTIVATE',
        'SETTINGS_UPDATE', 'ROLE_CHANGE',
        // Risk/Approval actions
        'RISK_ASSESSMENT', 'APPROVAL_REQUEST', 'APPROVAL_GRANT', 'APPROVAL_REJECT', 'ESCALATION',
        // SLA actions
        'SLA_CREATE', 'SLA_UPDATE', 'SLA_COMPLETE', 'SLA_BREACH',
        // Generic
        'OTHER',
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['AUTH', 'DOCUMENT', 'COMPANY', 'KYC', 'BILL', 'CASE', 'BID', 'TRANSACTION', 'NBFC', 'ADMIN', 'RISK', 'SLA', 'SYSTEM'],
      required: true,
    },

    // Target entity
    entityType: { 
      type: String,
      enum: ['User', 'Company', 'SubContractor', 'Bill', 'Case', 'Bid', 'Document', 'Transaction', 'Nbfc', 'CwcRf', 'Sla', 'System'],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityRef: { type: String }, // Human-readable reference (caseNumber, companyName, etc.)

    // Action details
    description: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Additional context data

    // Change tracking
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },

    // Request metadata
    ipAddress: { type: String },
    userAgent: { type: String },
    requestPath: { type: String },
    requestMethod: { type: String },

    // Status
    success: { type: Boolean, default: true },
    errorMessage: { type: String },

    // Tags for filtering
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.log = async function (data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - logging should never break the application
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
