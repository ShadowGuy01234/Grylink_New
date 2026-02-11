const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gryLinkSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, default: () => uuidv4() },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    salesAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },

    usedAt: { type: Date },
  },
  { timestamps: true }
);

// Check if link is valid
gryLinkSchema.methods.isValid = function () {
  return this.status === 'active' && this.expiresAt > new Date();
};

module.exports = mongoose.model('GryLink', gryLinkSchema);
