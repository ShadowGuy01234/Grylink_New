const mongoose = require("mongoose");

const cwcRfSchema = new mongoose.Schema(
  {
    // Reference number for the CWCRF
    cwcRfNumber: { type: String, unique: true },

    subContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubContractor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    epcId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    // ========================================
    // SECTION A: Buyer & Project Details
    // ========================================
    buyerDetails: {
      buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      buyerName: { type: String, trim: true },
      projectName: { type: String, trim: true },
      projectLocation: { type: String, trim: true },
    },

    // ========================================
    // SECTION B: Invoice Details
    // ========================================
    invoiceDetails: {
      invoiceNumber: { type: String, trim: true },
      invoiceDate: { type: Date },
      invoiceAmount: { type: Number },
      expectedPaymentDate: { type: Date },
      workDescription: { type: String, trim: true },
      purchaseOrderNumber: { type: String, trim: true },
      purchaseOrderDate: { type: Date },
      workCompletionDate: { type: Date },
      gstAmount: { type: Number },
      netInvoiceAmount: { type: Number },
    },

    // ========================================
    // SECTION C: CWC Request
    // ========================================
    cwcRequest: {
      invoiceAmount: { type: Number }, // Auto-filled from invoiceDetails
      requestedAmount: { type: Number },
      requestedTenure: { type: Number }, // In days (30/45/60/90)
      urgencyLevel: {
        type: String,
        enum: ['NORMAL', 'URGENT', 'CRITICAL'],
        default: 'NORMAL',
      },
      reasonForFunding: { type: String, trim: true },
      preferredDisbursementDate: { type: Date },
      collateralOffered: { type: String, trim: true },
      existingLoanDetails: { type: String, trim: true },
    },

    // ========================================
    // SECTION D: Interest Rate Preference
    // ========================================
    interestPreference: {
      preferenceType: {
        type: String,
        enum: ["RANGE", "MAX_ACCEPTABLE"],
        default: "RANGE",
      },
      minRate: { type: Number }, // Annual % (e.g., 16)
      maxRate: { type: Number }, // Annual % (e.g., 18)
      maxAcceptableRate: { type: Number }, // Alternative: "Up to X% p.a."
      preferredRepaymentFrequency: {
        type: String,
        enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY'],
        default: 'ONE_TIME',
      },
      processingFeeAcceptance: { type: Boolean, default: true },
      maxProcessingFeePercent: { type: Number },
      prepaymentPreference: {
        type: String,
        enum: ['WITH_PENALTY', 'WITHOUT_PENALTY', 'NO_PREPAYMENT'],
        default: 'WITHOUT_PENALTY',
      },
    },

    // ========================================
    // SELLER DECLARATION (Mandatory)
    // ========================================
    sellerDeclaration: {
      accepted: { type: Boolean, default: false },
      acceptedAt: { type: Date },
      ipAddress: { type: String },
      declarationText: {
        type: String,
        default:
          "I understand and agree that the Credit on Working Capital (CWC) availed through Gryork will be with recourse, and an escrow account will be created in my name for repayment of the facility.",
      },
    },

    // ========================================
    // OPS VERIFICATION (Phase 6 — Ops super access review)
    // ========================================
    opsVerification: {
      sectionA: {
        verified: { type: Boolean, default: false },
        notes: { type: String, trim: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
      },
      sectionB: {
        verified: { type: Boolean, default: false },
        notes: { type: String, trim: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
      },
      sectionC: {
        verified: { type: Boolean, default: false },
        notes: { type: String, trim: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
      },
      sectionD: {
        verified: { type: Boolean, default: false },
        notes: { type: String, trim: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
      },
      raBillVerified: { type: Boolean, default: false },
      wccVerified: { type: Boolean, default: false },
      measurementSheetVerified: { type: Boolean, default: false },
      opsNotes: { type: String, trim: true },
      opsVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      opsVerifiedAt: { type: Date },
    },

    // ========================================
    // OPS SUPER ACCESS — Edit Log & Detached Fields (Phase 6.2)
    // ========================================
    opsEditLog: [
      {
        section: { type: String },          // e.g. 'invoiceDetails', 'buyerDetails'
        field: { type: String },             // e.g. 'invoiceNumber', 'projectName'
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now },
        reason: { type: String, trim: true },
      },
    ],
    opsDetachedFields: [
      {
        section: { type: String },
        field: { type: String },
        detachedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        detachedAt: { type: Date, default: Date.now },
        reason: { type: String, trim: true },
        resolved: { type: Boolean, default: false },
        resolvedAt: { type: Date },
      },
    ],

    // ========================================
    // BUYER (EPC) VERIFICATION - Section A, B, C
    // ========================================
    buyerVerification: {
      // A: Approved CWC Amount (Mandatory)
      approvedAmount: { type: Number },

      // B: Repayment Timeline (Mandatory) - 30/45/60/90 days
      repaymentTimeline: {
        type: Number,
        enum: [30, 45, 60, 90],
      },

      // C: Repayment Arrangement Logic (Mandatory)
      repaymentArrangement: {
        source: {
          type: String,
          enum: [
            "PAYMENT_FROM_RA_BILL",
            "PAYMENT_FROM_CLIENT_RELEASE",
            "PAYMENT_FROM_INTERNAL_TREASURY",
            "PAYMENT_FROM_RETENTION_RELEASE",
            "OTHER",
          ],
        },
        otherDetails: { type: String, trim: true }, // If source is OTHER
        remarks: { type: String, trim: true }, // Additional context
      },

      // D: Buyer Declaration (Mandatory — Step 9.4)
      buyerDeclaration: {
        accepted: { type: Boolean, default: false },
        acceptedAt: { type: Date },
        ipAddress: { type: String },
      },

      notes: { type: String, trim: true },

      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
    },

    // ========================================
    // STATUS FLOW (as per workflow document)
    // ========================================
    status: {
      type: String,
      enum: [
        "SUBMITTED",                   // SC submitted CWCRF
        "KYC_REQUIRED",                  // KYC needs completion
        "KYC_IN_PROGRESS",               // KYC chat ongoing
        "KYC_COMPLETED",                 // KYC verified
        "OPS_REVIEW",                    // Ops super-access review (Phase 6)
        "UNDER_RISK_REVIEW",             // RMT reviewing (Phase 7)
        "RMT_APPROVED",                  // RMT forwarded back to Ops (Phase 7.5)
        "BUYER_VERIFICATION_PENDING",    // Ops triaged → waiting for EPC (Phase 8)
        "BUYER_APPROVED",                // EPC verified with A, B, C, D (Phase 9)
        "BUYER_REJECTED",                // EPC rejected
        "CWCAF_READY",                   // CWCAF generated (Phase 10.1)
        "SHARED_WITH_NBFC",              // Sent to matching NBFCs (Phase 10.3)
        "QUOTES_RECEIVED",               // NBFCs submitted quotes
        "NBFC_SELECTED",                 // Seller picked an NBFC
        "MOVED_TO_NBFC_PROCESS",         // Handed off to NBFC
        "NBFC_DUE_DILIGENCE",            // NBFC running due diligence (Phase 11.4)
        "NBFC_SANCTIONED",               // NBFC issued sanction letter (Phase 11.4)
        "DISBURSEMENT_INITIATED",        // Disbursement process started (Phase 11.4)
        "DISBURSED",                     // Funds disbursed to SC (Phase 11.4)
        "ACTION_REQUIRED",               // Issues need resolution
        "REJECTED",                      // Final rejection
        "COMPLETED",                     // Successfully funded
      ],
      default: "SUBMITTED",
    },

    // ========================================
    // NBFC QUOTATIONS
    // ========================================
    nbfcQuotations: [
      {
        nbfcId: { type: mongoose.Schema.Types.ObjectId, ref: "Nbfc" },
        sharedAt: { type: Date },
        quotation: {
          interestRate: { type: Number }, // Annual %
          tenure: { type: Number }, // Days
          terms: { type: String, trim: true },
          remarks: { type: String, trim: true },
        },
        quotedAt: { type: Date },
        status: {
          type: String,
          enum: ["PENDING", "QUOTED", "SELECTED", "NOT_SELECTED", "WITHDRAWN", "REJECTED"],
          default: "PENDING",
        },
      },
    ],

    // Selected NBFC after seller choice
    selectedNbfc: {
      nbfcId: { type: mongoose.Schema.Types.ObjectId, ref: "Nbfc" },
      selectedAt: { type: Date },
      finalInterestRate: { type: Number },
      finalTenure: { type: Number },
    },

    // ========================================
    // NBFC POST-QUOTATION PROCESS (Phase 11.4)
    // ========================================
    nbfcProcess: {
      // Due Diligence
      dueDiligence: {
        started: { type: Boolean, default: false },
        startedAt: { type: Date },
        checklist: {
          kycVerified: { type: Boolean, default: false },
          bankStatementReviewed: { type: Boolean, default: false },
          invoiceAuthenticated: { type: Boolean, default: false },
          epcConfirmationReceived: { type: Boolean, default: false },
          creditScoreChecked: { type: Boolean, default: false },
          collateralAssessed: { type: Boolean, default: false },
        },
        notes: { type: String, trim: true },
        completedAt: { type: Date },
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        result: { type: String, enum: ["APPROVED", "REJECTED", "CONDITIONAL"], },
        conditions: { type: String, trim: true },
      },
      // Sanction Letter
      sanctionLetter: {
        issued: { type: Boolean, default: false },
        issuedAt: { type: Date },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        sanctionAmount: { type: Number },
        sanctionedInterestRate: { type: Number },
        sanctionedTenure: { type: Number },
        specialConditions: { type: String, trim: true },
        letterUrl: { type: String },                   // Uploaded sanction letter PDF
        acceptedBySc: { type: Boolean, default: false },
        acceptedAt: { type: Date },
      },
      // Disbursement
      disbursement: {
        initiated: { type: Boolean, default: false },
        initiatedAt: { type: Date },
        initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number },
        utrNumber: { type: String, trim: true },       // Bank UTR
        disbursedAt: { type: Date },
        disbursementMode: { type: String, enum: ["NEFT", "RTGS", "IMPS", "OTHER"], default: "NEFT" },
        escrowAccountId: { type: String, trim: true },
        confirmed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
      },
    },

    // Platform fee
    platformFeePaid: { type: Boolean, default: false },
    platformFeeAmount: { type: Number, default: 1000 },
    paymentReference: { type: String },

    // KYC details
    kycNotes: { type: String },
    kycCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    kycCompletedAt: { type: Date },

    // Case reference (when case is created from this CWCRF)
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
      },
    ],
  },
  { timestamps: true },
);

// Auto-generate CWCRF number
cwcRfSchema.pre("save", async function () {
  if (!this.cwcRfNumber) {
    const count = await mongoose.model("CwcRf").countDocuments();
    this.cwcRfNumber = `CWCRF-${String(count + 1).padStart(6, "0")}`;
  }
  // Auto-fill invoice amount in CWC request
  if (this.invoiceDetails?.invoiceAmount && !this.cwcRequest?.invoiceAmount) {
    this.cwcRequest = this.cwcRequest || {};
    this.cwcRequest.invoiceAmount = this.invoiceDetails.invoiceAmount;
  }
});

// Index for efficient queries
cwcRfSchema.index({ status: 1, subContractorId: 1 });
cwcRfSchema.index({ "buyerDetails.buyerId": 1, status: 1 });
// cwcRfNumber is already indexed via unique: true in schema definition

module.exports = mongoose.model("CwcRf", cwcRfSchema);
