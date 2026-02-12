const mongoose = require('mongoose');

const nbfcSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true }, // Short code like 'HDFC', 'ICICI'
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    // Registration details
    cin: { type: String, trim: true },
    rbiLicense: { type: String, trim: true },

    // NBFC filtering criteria (SOP Phase 7)
    coverage: {
      geographies: [{ type: String }], // States/regions covered
      sectors: [{ type: String }], // Construction, Infra, etc.
      minDealSize: { type: Number, default: 0 },
      maxDealSize: { type: Number },
    },

    // Risk appetite & preferences
    riskAppetite: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    acceptedRiskLevels: [{ type: String, enum: ['low', 'medium', 'high'] }],

    // Performance metrics (auto-updated)
    metrics: {
      approvalRate: { type: Number, default: 0 }, // Percentage
      avgProcessingDays: { type: Number, default: 0 },
      totalDealsProcessed: { type: Number, default: 0 },
      totalAmountDisbursed: { type: Number, default: 0 },
    },

    // Interest rate range
    interestRates: {
      minRate: { type: Number }, // Annual %
      maxRate: { type: Number },
      avgRate: { type: Number },
    },

    // Preference score (auto-calculated by Tech Engine)
    preferenceScore: { type: Number, default: 50 }, // 0-100

    // Contact persons
    contacts: [
      {
        name: String,
        designation: String,
        email: String,
        phone: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },

    // User account for NBFC portal access
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

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

// Index for efficient filtering
nbfcSchema.index({ 'coverage.geographies': 1, 'coverage.sectors': 1, status: 1 });
nbfcSchema.index({ preferenceScore: -1, status: 1 });

module.exports = mongoose.model('Nbfc', nbfcSchema);
