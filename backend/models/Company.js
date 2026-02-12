const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    // Registration details
    cin: { type: String, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    pan: { type: String, uppercase: true, trim: true },

    status: {
      type: String,
      enum: [
        'LEAD_CREATED',
        'CREDENTIALS_CREATED',
        'DOCS_SUBMITTED',
        'ACTION_REQUIRED',
        'ACTIVE',
        'DORMANT', // Non-responsive (SOP Phase 5)
        'SUSPENDED',
        'BLACKLISTED',
      ],
      default: 'LEAD_CREATED',
    },

    role: {
      type: String,
      enum: ['BUYER', 'PENDING', 'NBFC'],
      default: 'PENDING',
    },

    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Verification notes from Ops
    verificationNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },

    // Dormant handling (SOP Phase 5 - Day 10-14 non-response)
    dormant: {
      markedAt: Date,
      reason: String,
      escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reactivatedAt: Date,
      reactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // KYC validity & Re-KYC (SOP Section 8)
    kycValidity: {
      lastKycAt: Date,
      expiresAt: Date, // 12 months from last KYC
      reKycTriggered: { type: Boolean, default: false },
      reKycReason: { type: String, enum: ['BANK_CHANGE', 'BOARD_CHANGE', 'RATING_DOWNGRADE', 'NBFC_REQUEST', 'EXPIRED'] },
    },

    // Risk score (impacts future engagements per SOP Section 13)
    riskScore: { type: Number, default: 0 },
    overdueCount: { type: Number, default: 0 },

    // SLA Tracking
    slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sla' },

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
companySchema.index({ pan: 1 });
companySchema.index({ gstin: 1 });

module.exports = mongoose.model('Company', companySchema);
