const mongoose = require('mongoose');

// Blacklist model for fraud tracking (SOP Section 12)
const blacklistSchema = new mongoose.Schema(
  {
    // Primary identifiers - lifetime blacklist by PAN + GST
    pan: { type: String, uppercase: true, trim: true },
    gstin: { type: String, uppercase: true, trim: true },

    // Entity details at time of blacklisting
    companyName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    // Reference to original entity
    entityType: {
      type: String,
      enum: ['company', 'subcontractor'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityRef' },
    entityRef: { type: String, enum: ['Company', 'SubContractor'] },

    // Blacklist reason
    reason: {
      type: String,
      enum: [
        'FRAUD',
        'FAKE_DOCUMENTS',
        'MISREPRESENTATION',
        'PAYMENT_DEFAULT',
        'EPC_REJECTION_FRAUD',
        'OTHER',
      ],
      required: true,
    },
    reasonDetails: { type: String, trim: true },

    // Who initiated blacklisting
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now },

    // Approval chain (requires Ops Manager approval)
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'ACTIVE', 'REVOKED'],
      default: 'PENDING_APPROVAL',
    },

    // Supporting evidence
    evidence: [
      {
        fileName: String,
        fileUrl: String,
        cloudinaryPublicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Revocation details (if ever lifted)
    revocationReason: { type: String },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for quick lookup during onboarding
blacklistSchema.index({ pan: 1 });
blacklistSchema.index({ gstin: 1 });
blacklistSchema.index({ email: 1 });
blacklistSchema.index({ status: 1 });

// Static method to check if entity is blacklisted
blacklistSchema.statics.isBlacklisted = async function (query) {
  const conditions = [];
  if (query.pan) conditions.push({ pan: query.pan.toUpperCase(), status: 'ACTIVE' });
  if (query.gstin) conditions.push({ gstin: query.gstin.toUpperCase(), status: 'ACTIVE' });
  if (query.email) conditions.push({ email: query.email.toLowerCase(), status: 'ACTIVE' });

  if (conditions.length === 0) return null;

  return await this.findOne({ $or: conditions });
};

module.exports = mongoose.model('Blacklist', blacklistSchema);
