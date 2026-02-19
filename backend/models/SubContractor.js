const mongoose = require("mongoose");

const subContractorSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC PROFILE (Mandatory during signup)
    // ========================================
    companyName: { type: String, trim: true }, // Legal Name of Firm
    contactName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    // Constitution Type (Workflow Section 4 - Step 2)
    constitutionType: {
      type: String,
      enum: ["PROPRIETORSHIP", "PARTNERSHIP", "LLP", "PVT_LTD", "PUBLIC_LTD"],
    },

    // Registered Address
    registeredAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: "India" },
    },
    address: { type: String, trim: true }, // Legacy field

    // Registration details
    vendorId: { type: String, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    pan: { type: String, uppercase: true, trim: true },

    // ========================================
    // BANK ACCOUNT DETAILS (Workflow Section 4 - Step 2)
    // ========================================
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, uppercase: true, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      accountType: {
        type: String,
        enum: ["CURRENT", "SAVINGS"],
        default: "CURRENT",
      },
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "FAILED"],
        default: "PENDING",
      },
      verifiedAt: { type: Date },
    },

    // ========================================
    // KYC DOCUMENTS (Workflow Section 4 - Step 3)
    // ========================================
    kycDocuments: {
      panCard: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
      },
      aadhaarCard: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
        masked: { type: Boolean, default: true }, // Masked Aadhaar allowed
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
      },
      gstCertificate: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
      },
      cancelledCheque: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
      },
    },

    // Additional documents requested by ops team
    additionalDocuments: [
      {
        label: { type: String, required: true },
        description: { type: String },
        requestedAt: { type: Date, default: Date.now },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        fileName: { type: String },
        fileUrl: { type: String },
        cloudinaryPublicId: { type: String },
        uploadedAt: { type: Date },
        status: {
          type: String,
          enum: ["REQUESTED", "UPLOADED", "VERIFIED", "REJECTED"],
          default: "REQUESTED",
        },
      },
    ],

    // KYC overall status
    kycStatus: {
      type: String,
      enum: [
        "NOT_STARTED",
        "DOCUMENTS_PENDING",
        "UNDER_REVIEW",
        "COMPLETED",
        "REJECTED",
      ],
      default: "NOT_STARTED",
    },
    kycCompletedAt: { type: Date },
    kycCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ========================================
    // SELLER DECLARATION (Workflow Section 4 - Step 4)
    // Hard Gate: CWCRF cannot be submitted without this
    // ========================================
    sellerDeclaration: {
      accepted: { type: Boolean, default: false },
      acceptedAt: { type: Date },
      ipAddress: { type: String },
      userAgent: { type: String },
      declarationText: {
        type: String,
        default:
          "I understand and agree that the Credit on Working Capital (CWC) availed through Gryork will be with recourse, and an escrow account will be created in my name for repayment of the facility.",
      },
    },

    // ========================================
    // STATUS (Enhanced with workflow states)
    // ========================================
    status: {
      type: String,
      enum: [
        "LEAD_CREATED",
        "PROFILE_INCOMPLETE",
        "PROFILE_COMPLETED",
        "KYC_PENDING", // KYC documents not submitted
        "KYC_IN_PROGRESS", // KYC under review
        "KYC_COMPLETED", // KYC verified - CWCRF access enabled
        "DOCS_SUBMITTED",
        "RMT_PENDING", // Awaiting risk assessment
        "RMT_APPROVED",
        "RMT_REJECTED",
        "EPC_VALIDATION_PENDING",
        "EPC_VALIDATED",
        "EPC_REJECTED",
        "ACTIVE", // Fully onboarded
        "DORMANT", // Non-responsive per SOP
        "COOLING_PERIOD", // 6-month cooling after rejection
        "BLACKLISTED",
      ],
      default: "LEAD_CREATED",
    },

    // Linked EPC company
    linkedEpcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Selected EPC during profile completion
    selectedEpcId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    // Sales contact tracking (Step 8)
    contactedAt: { type: Date },
    contactedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contactNotes: { type: String, trim: true },

    // ========================================
    // LEGACY DOCUMENT FIELDS (for backward compatibility)
    // ========================================
    documents: {
      incorporationDocs: [
        {
          fileName: String,
          fileUrl: String,
          cloudinaryPublicId: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
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
      bankStatements: [
        {
          fileName: String,
          fileUrl: String,
          cloudinaryPublicId: String,
          period: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      epcAgreement: {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: Date,
      },
    },

    // Past projects (SOP Phase 4)
    pastProjects: [
      {
        projectName: String,
        clientName: String,
        value: Number,
        completionDate: Date,
        description: String,
      },
    ],

    // Risk Assessment (SOP Phase 3)
    riskAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerRiskAssessment",
    },
    riskCategory: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },

    // EPC Validation (SOP Phase 5)
    epcValidation: {
      status: { type: String, enum: ["PENDING", "VALIDATED", "REJECTED"] },
      validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      validatedAt: Date,
      notes: String,
      rejectionReason: String,
    },

    // SLA Tracking
    slaId: { type: mongoose.Schema.Types.ObjectId, ref: "Sla" },

    // Dormant handling (SOP Phase 5 - Day 10-14)
    dormant: {
      markedAt: Date,
      reason: String,
      escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reactivatedAt: Date,
      reactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Cooling period (SOP Phase 8 - 6 months after rejection)
    coolingPeriod: {
      startedAt: Date,
      endsAt: Date,
      reason: String,
      earlyReentryApproved: { type: Boolean, default: false },
      approvalRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApprovalRequest",
      },
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
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
      },
    ],

    // Sales contact log (tracked by sales team)
    contactLog: [
      {
        method: { type: String, enum: ['Call', 'Email', 'WhatsApp', 'In-Person'] },
        outcome: { type: String },
        notes: { type: String },
        loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        loggedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Index for blacklist checks
subContractorSchema.index({ pan: 1 });
subContractorSchema.index({ gstin: 1 });
subContractorSchema.index({ status: 1, linkedEpcId: 1 });
subContractorSchema.index({ kycStatus: 1 });

// Helper method to check if seller can submit CWCRF
subContractorSchema.methods.canSubmitCwcRf = function () {
  return (
    this.kycStatus === "COMPLETED" && this.sellerDeclaration?.accepted === true
  );
};

module.exports = mongoose.model("SubContractor", subContractorSchema);
