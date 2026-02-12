const mongoose = require('mongoose');

const subContractorSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    contactName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    vendorId: { type: String, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    pan: { type: String, uppercase: true, trim: true },

    status: {
      type: String,
      enum: [
        'LEAD_CREATED',
        'PROFILE_INCOMPLETE',
        'PROFILE_COMPLETED',
        'DOCS_SUBMITTED',
        'RMT_PENDING', // Awaiting risk assessment
        'RMT_APPROVED',
        'RMT_REJECTED',
        'EPC_VALIDATION_PENDING', // Awaiting EPC validation
        'EPC_VALIDATED',
        'EPC_REJECTED',
        'ACTIVE', // Fully onboarded
        'DORMANT', // Non-responsive per SOP
        'COOLING_PERIOD', // 6-month cooling after rejection
        'BLACKLISTED',
      ],
      default: 'LEAD_CREATED',
    },

    // Linked EPC company
    linkedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Selected EPC during profile completion
    selectedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    // Sales contact tracking (Step 8)
    contactedAt: { type: Date },
    contactedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactNotes: { type: String, trim: true },

    // Full Seller Onboarding Documents (SOP Phase 4)
    documents: {
      incorporationDocs: [{
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: { type: Date, default: Date.now },
      }],
      gstCertificate: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
      },
      panCard: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
      },
      bankStatements: [{
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        period: String, // e.g., "Jan 2025 - Jun 2025"
        uploadedAt: { type: Date, default: Date.now },
      }],
      epcAgreement: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
      },
    },

    // Past projects (SOP Phase 4)
    pastProjects: [{
      projectName: String,
      clientName: String,
      value: Number,
      completionDate: Date,
      description: String,
    }],

    // Risk Assessment (SOP Phase 3)
    riskAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerRiskAssessment' },
    riskCategory: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },

    // EPC Validation (SOP Phase 5)
    epcValidation: {
      status: { type: String, enum: ['PENDING', 'VALIDATED', 'REJECTED'] },
      validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      validatedAt: Date,
      notes: String,
      rejectionReason: String,
    },

    // SLA Tracking
    slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sla' },

    // Dormant handling (SOP Phase 5 - Day 10-14)
    dormant: {
      markedAt: Date,
      reason: String,
      escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reactivatedAt: Date,
      reactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // Cooling period (SOP Phase 8 - 6 months after rejection)
    coolingPeriod: {
      startedAt: Date,
      endsAt: Date,
      reason: String,
      earlyReentryApproved: { type: Boolean, default: false },
      approvalRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRequest' },
    },

    // Re-KYC tracking (SOP Section 8)
    kycValidity: {
      lastKycAt: Date,
      expiresAt: Date, // 12 months from last KYC
      reKycTriggered: { type: Boolean, default: false },
      reKycReason: String,
    },

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

// Index for blacklist checks
subContractorSchema.index({ pan: 1 });
subContractorSchema.index({ gstin: 1 });
subContractorSchema.index({ status: 1, linkedEpcId: 1 });

module.exports = mongoose.model('SubContractor', subContractorSchema);
