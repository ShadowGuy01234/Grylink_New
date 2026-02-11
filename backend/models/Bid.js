const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    epcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    placedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    bidAmount: { type: Number, required: true },
    fundingDurationDays: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'ACCEPTED',
        'REJECTED',
        'NEGOTIATION_IN_PROGRESS',
        'COMMERCIAL_LOCKED',
      ],
      default: 'SUBMITTED',
    },

    // Negotiation history
    negotiations: [
      {
        counterAmount: Number,
        counterDuration: Number,
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        proposedByRole: { type: String, enum: ['epc', 'subcontractor'] },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Lock details
    lockedTerms: {
      finalAmount: Number,
      finalDuration: Number,
      lockedAt: Date,
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

module.exports = mongoose.model('Bid', bidSchema);
