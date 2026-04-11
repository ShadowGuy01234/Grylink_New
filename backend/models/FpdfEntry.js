const mongoose = require('mongoose');

const CHECKLIST_RESPONSE_OPTIONS = ['YES', 'NO', 'TO_CHECK_CONFIRM'];

const complianceChecklistItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    response: {
      type: String,
      enum: CHECKLIST_RESPONSE_OPTIONS,
    },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const fpdfEntrySchema = new mongoose.Schema(
  {
    // ─── Section A — Basic Info ─────────────────────────────────────
    companyName: { type: String, required: true, trim: true },
    companyType: {
      type: String,
      enum: ['NBFC', 'BANK', 'FINTECH'],
      required: true,
    },
    location: {
      type: String,
      enum: ['NCR', 'NON_NCR'],
      required: true,
    },

    // ─── Section B — Lending Fit ────────────────────────────────────
    lendingSegments: [
      {
        type: String,
        enum: ['MSME_LENDING', 'VENDOR_FINANCING', 'INFRASTRUCTURE'],
      },
    ],
    products: [
      {
        type: String,
        enum: ['WORKING_CAPITAL', 'INVOICE_FINANCING'],
      },
    ],
    ticketSize: {
      type: String,
      enum: ['10L_2CR', 'HIGHER'],
    },
    geographicPreference: {
      delhiNcrActive: { type: Boolean, default: false },
      panIndiaCoverage: { type: Boolean, default: false },
      regionRestricted: { type: Boolean, default: false },
    },
    // Legacy geography field retained for backward compatibility.
    geography: {
      type: String,
      enum: ['NCR', 'PAN_INDIA', 'RESTRICTED'],
    },

    // ─── Section C — Outreach Tracking ──────────────────────────────
    outreach: {
      linkedinOutreach: { type: Boolean, default: false },
      linkedinResponse: { type: Boolean, default: false },
      callAttempted: { type: Boolean, default: false },
      callConnected: { type: Boolean, default: false },
      conversationQuality: {
        type: String,
        enum: ['NONE', 'BASIC', 'MEANINGFUL'],
        default: 'NONE',
      },
    },

    // ─── Section D — Engagement ─────────────────────────────────────
    engagement: {
      meetingStatus: {
        type: String,
        enum: ['OFFLINE_CONFIRMED', 'ONLINE_CONFIRMED', 'NOT_CONFIRMED', 'OFFLINE', 'ONLINE', 'NONE'],
        default: 'NOT_CONFIRMED',
      },
      willingness: {
        type: String,
        enum: ['OPEN', 'MAYBE', 'NOT_INTERESTED'],
        default: 'NOT_INTERESTED',
      },
    },

    // ─── Section E — Consultant Checklist (PDF) ───────────────────
    complianceChecklist: {
      type: [complianceChecklistItemSchema],
      default: [],
    },

    // ─── Scores (auto-calculated) ───────────────────────────────────
    scores: {
      lendingFit: { type: Number, default: 0 },
      ticketSizeScore: { type: Number, default: 0 },
      engagementScore: { type: Number, default: 0 },
      accessibilityScore: { type: Number, default: 0 },
      geographyScore: { type: Number, default: 0 },
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
    convertedToNbfcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nbfc' },
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
fpdfEntrySchema.index({ pipeline: 1, status: 1 });
fpdfEntrySchema.index({ createdBy: 1 });
fpdfEntrySchema.index({ classification: 1 });
fpdfEntrySchema.index({ 'scores.totalScore': -1 });

module.exports = mongoose.model('FpdfEntry', fpdfEntrySchema);
