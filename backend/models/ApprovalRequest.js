const mongoose = require('mongoose');

// Approval Request model for escalation workflows (SOP Section 7)
const approvalRequestSchema = new mongoose.Schema(
  {
    // Request type based on SOP escalation matrix
    requestType: {
      type: String,
      enum: [
        'SELLER_RISK_REJECTION', // Ops Manager
        'HIGH_RISK_CASE', // Ops Manager → Founders
        'DEAL_ABOVE_1CR', // Founders (mandatory)
        'EPC_DELAY_ESCALATION', // Ops Manager → Founders
        'NBFC_EXCEPTION', // Ops Manager
        'BLACKLIST_APPROVAL', // Ops Manager
        'EARLY_REENTRY', // Ops Manager (from 6-month cooling)
        'PARTIAL_FUNDING', // Ops Manager
        'AGENT_MISCONDUCT', // Founders
        'STRATEGIC_EXCEPTION', // Founders
      ],
      required: true,
    },

    // Request details
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number }, // For deal size checks

    // Entity reference
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityRef: { type: String }, // Model name

    // Related entities
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    subContractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    nbfcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nbfc' },

    // Request initiator
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },

    // Approval chain (can have multiple levels)
    approvalChain: [
      {
        level: Number, // 1 = Ops Manager, 2 = Founders
        approverRole: { type: String, enum: ['ops_manager', 'founder', 'admin'] },
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        decision: String,
        notes: String,
        decidedAt: Date,
      },
    ],

    // Current level pending approval
    currentLevel: { type: Number, default: 1 },
    pendingWith: { type: String, enum: ['ops_manager', 'founder', 'admin'] },

    // Overall status
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED', 'CANCELLED'],
      default: 'PENDING',
    },

    // Final decision
    finalDecision: { type: String, enum: ['APPROVED', 'REJECTED'] },
    finalDecisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    finalDecisionAt: { type: Date },
    finalNotes: { type: String },

    // Priority
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },

    // Supporting documents
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-set pending approver based on request type
approvalRequestSchema.pre('save', function (next) {
  if (this.isNew) {
    const founderTypes = ['DEAL_ABOVE_1CR', 'HIGH_RISK_CASE', 'AGENT_MISCONDUCT', 'STRATEGIC_EXCEPTION'];
    if (founderTypes.includes(this.requestType)) {
      this.pendingWith = 'founder';
    } else {
      this.pendingWith = 'ops_manager';
    }
  }
  next();
});

// Index for dashboard queries
approvalRequestSchema.index({ status: 1, pendingWith: 1, priority: -1 });
approvalRequestSchema.index({ requestedBy: 1, status: 1 });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
