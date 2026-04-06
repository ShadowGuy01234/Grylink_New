const mongoose = require('mongoose');

const groundIntelligenceSchema = new mongoose.Schema({
  conversationDate: { type: Date, default: Date.now },
  contactName: { type: String, trim: true },
  contactRole: { type: String, trim: true },
  channel: {
    type: String,
    enum: ['WHATSAPP', 'CALL', 'LINKEDIN', 'SITE_VISIT'],
    required: true,
  },
  billingFlow: {
    type: String,
    enum: ['SMOOTH', 'SLIGHT_DELAY', 'NOTICEABLE_DELAY'],
  },
  subcontractorUsage: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  },
  executionPressure: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  },
  sentiment: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'SLIGHTLY_NEGATIVE'],
  },
  notes: { type: String, trim: true },
}, { _id: true });

const bdfEntrySchema = new mongoose.Schema(
  {
    // ─── Section A — Project Qualification ──────────────────────────
    companyName: { type: String, required: true, trim: true },
    companyType: { type: String, enum: ['EPC', 'DEVELOPER'], required: true },
    projectName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    projectType: { type: String, default: 'Residential', trim: true },
    projectValue: {
      type: String,
      enum: ['BELOW_100CR', '100_500CR', '500_1500CR', 'ABOVE_1500CR'],
      required: true,
    },
    projectStage: {
      type: String,
      enum: ['0_30', '30_60', 'ABOVE_60'],
      required: true,
    },

    // ─── Section B — Company Validation ─────────────────────────────
    websiteAvailable: { type: Boolean, default: false },
    linkedinPresence: { type: Boolean, default: false },
    companySize: { type: String, enum: ['SMALL', 'MID', 'LARGE'] },

    // ─── Section C — Accessibility ──────────────────────────────────
    employeesIdentified: { type: Boolean, default: false },
    phoneNumberAvailable: { type: Boolean, default: false },
    reachability: { type: String, enum: ['EASY', 'MODERATE', 'DIFFICULT'] },

    // ─── Section D — Ground Intelligence ────────────────────────────
    groundIntelligence: [groundIntelligenceSchema],

    // ─── Scores (auto-calculated) ───────────────────────────────────
    scores: {
      projectFit: { type: Number, default: 0 },
      groundSignals: { type: Number, default: 0 },
      accessibility: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      conversionAngle: { type: Number, default: 0 },
    },

    // ─── Classification & Pipeline ──────────────────────────────────
    classification: {
      type: String,
      enum: ['RED', 'ORANGE', 'YELLOW', 'GREEN'],
      default: 'RED',
    },
    pipeline: {
      type: String,
      enum: ['ARCHIVE', 'HOLD', 'STRATEGIC', 'PRIORITY'],
      default: 'ARCHIVE',
    },

    // ─── Status ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED', 'CONVERTED'],
      default: 'DRAFT',
    },

    // ─── Conversion ─────────────────────────────────────────────────
    convertedToCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    convertedAt: { type: Date },

    // ─── Ownership ──────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },

    // ─── History ────────────────────────────────────────────────────
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

// Indexes
bdfEntrySchema.index({ pipeline: 1, status: 1 });
bdfEntrySchema.index({ createdBy: 1 });
bdfEntrySchema.index({ classification: 1 });
bdfEntrySchema.index({ 'scores.totalScore': -1 });

module.exports = mongoose.model('BdfEntry', bdfEntrySchema);
