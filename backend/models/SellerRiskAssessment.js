const mongoose = require('mongoose');

// Seller Risk Assessment model for pre-screening (SOP Phase 3)
const sellerRiskAssessmentSchema = new mongoose.Schema(
  {
    subContractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor', required: true },

    // Checklist-based assessment (RMT)
    checklist: {
      // Business verification
      businessRegistered: { type: Boolean },
      gstActive: { type: Boolean },
      panVerified: { type: Boolean },
      addressVerified: { type: Boolean },

      // Financial health
      bankStatementProvided: { type: Boolean },
      positiveBalance: { type: Boolean },
      regularTransactions: { type: Boolean },

      // Track record
      hasPastProjects: { type: Boolean },
      epcRelationshipValid: { type: Boolean },
      noBlacklistMatch: { type: Boolean },

      // Documents
      documentsComplete: { type: Boolean },
      documentsAuthentic: { type: Boolean },
    },

    // Numeric risk score (0-100, higher = riskier)
    riskScore: { type: Number, required: true },

    // Risk category
    riskCategory: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },

    // Assessment notes
    notes: { type: String },
    redFlags: [{ type: String }], // List of concerns

    // Decision
    recommendation: {
      type: String,
      enum: ['PROCEED', 'REVIEW', 'REJECT'],
      required: true,
    },

    // Assessed by RMT
    assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessedAt: { type: Date, default: Date.now },

    // Approval for high-risk (requires Ops Manager per SOP Year-1 policy)
    requiresApproval: { type: Boolean, default: false },
    approvalRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRequest' },

    // Final status
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_OPS_APPROVAL', 'NEEDS_FOUNDER_APPROVAL'],
      default: 'PENDING',
    },

    // Final decision details
    finalDecision: { type: String, enum: ['PROCEED', 'REJECT'] },
    finalDecisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    finalDecisionAt: { type: Date },
    finalNotes: { type: String },
  },
  { timestamps: true }
);

// Auto-determine if approval needed based on risk category
sellerRiskAssessmentSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('riskCategory')) {
    if (this.riskCategory === 'HIGH') {
      this.requiresApproval = true;
      this.status = 'NEEDS_FOUNDER_APPROVAL'; // Year-1 policy: High risk needs Founder approval
    } else if (this.recommendation === 'REJECT') {
      this.requiresApproval = true;
      this.status = 'NEEDS_OPS_APPROVAL';
    }
  }
  next();
});

// Index
sellerRiskAssessmentSchema.index({ subContractorId: 1 });
sellerRiskAssessmentSchema.index({ status: 1, riskCategory: 1 });

module.exports = mongoose.model('SellerRiskAssessment', sellerRiskAssessmentSchema);
