const mongoose = require('mongoose');

// Transaction/Escrow model for deal execution (SOP Phase 8)
const transactionSchema = new mongoose.Schema(
  {
    // Case reference
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },

    // Parties
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubContractor', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    nbfcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nbfc', required: true },

    // Transaction identifiers
    transactionNumber: { type: String, unique: true },

    // Financial details
    billAmount: { type: Number, required: true },
    discountedAmount: { type: Number, required: true }, // Amount paid to seller
    interestRate: { type: Number, required: true }, // Annual %
    fundingDurationDays: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },

    // Partial funding support (60-70% as per SOP)
    fundingType: {
      type: String,
      enum: ['FULL', 'PARTIAL'],
      default: 'FULL',
    },
    fundingPercentage: { type: Number, default: 100 },

    // Written approvals for partial funding
    partialFundingApprovals: {
      sellerApproved: { type: Boolean, default: false },
      sellerApprovedAt: Date,
      buyerApproved: { type: Boolean, default: false },
      buyerApprovedAt: Date,
    },

    // Escrow/TRA details (mandatory per SOP)
    escrow: {
      accountNumber: String,
      bankName: String,
      ifsc: String,
      traSetup: { type: Boolean, default: false },
      traSetupDate: Date,
      traReference: String,
    },

    // Disbursement tracking
    disbursement: {
      status: {
        type: String,
        enum: ['PENDING', 'INITIATED', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
      },
      initiatedAt: Date,
      completedAt: Date,
      reference: String,
      amount: Number,
      failureReason: String,
    },

    // Repayment tracking
    repayment: {
      dueDate: Date,
      reminderSentAt: Date, // 1 month before due date per SOP
      status: {
        type: String,
        enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'OVERDUE', 'DEFAULTED'],
        default: 'PENDING',
      },
      paidAmount: { type: Number, default: 0 },
      paidAt: Date,
      overdueBy: { type: Number, default: 0 }, // Days overdue
    },

    // Overall transaction status
    status: {
      type: String,
      enum: [
        'PENDING_ESCROW',
        'ESCROW_SETUP',
        'PENDING_DISBURSEMENT',
        'DISBURSED',
        'AWAITING_REPAYMENT',
        'REPAID',
        'OVERDUE',
        'DEFAULTED',
        'CANCELLED',
      ],
      default: 'PENDING_ESCROW',
    },

    // Recourse handling (SOP Section 13)
    recourse: {
      triggered: { type: Boolean, default: false },
      triggeredAt: Date,
      notes: String,
      resolution: String,
      resolvedAt: Date,
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

// Auto-generate transaction number
transactionSchema.pre('save', async function (next) {
  if (!this.transactionNumber) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionNumber = `TXN-${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Index for due date tracking
transactionSchema.index({ 'repayment.dueDate': 1, 'repayment.status': 1 });
transactionSchema.index({ status: 1, nbfcId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
