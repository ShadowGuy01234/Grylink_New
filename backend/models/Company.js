const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: [
        'LEAD_CREATED',
        'CREDENTIALS_CREATED',
        'DOCS_SUBMITTED',
        'ACTION_REQUIRED',
        'ACTIVE',
      ],
      default: 'LEAD_CREATED',
    },

    role: {
      type: String,
      enum: ['BUYER', 'PENDING'],
      default: 'PENDING',
    },

    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Verification notes from Ops
    verificationNotes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },

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

module.exports = mongoose.model('Company', companySchema);
