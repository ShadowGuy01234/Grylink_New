const mongoose = require("mongoose");

// Agent/Commission Model (SOP Section 11)
const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    company: { type: String },

    // Agent Status
    status: {
      type: String,
      enum: ["ACTIVE", "WARNED", "SUSPENDED", "BLACKLISTED"],
      default: "ACTIVE",
    },

    // Commissions
    commissions: [
      {
        epcId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
        epcName: { type: String },
        firstCwcId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transaction",
        },
        commissionAmount: { type: Number },
        commissionPercentage: { type: Number },
        status: {
          type: String,
          enum: ["PENDING", "PAID", "CANCELLED"],
          default: "PENDING",
        },
        paidAt: { type: Date },
        paymentReference: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // EPCs introduced by this agent
    introducedEpcs: [
      {
        epcId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
        introducedAt: { type: Date, default: Date.now },
        firstCwcCompleted: { type: Boolean, default: false },
        commissionEligible: { type: Boolean, default: true }, // Lifetime eligibility per SOP
      },
    ],

    // Performance metrics
    metrics: {
      totalEpcsIntroduced: { type: Number, default: 0 },
      activeEpcs: { type: Number, default: 0 },
      totalCommissionEarned: { type: Number, default: 0 },
      pendingCommission: { type: Number, default: 0 },
    },

    // Misconduct tracking (SOP Section 11)
    misconductHistory: [
      {
        type: {
          type: String,
          enum: [
            "WEAK_EPC_PUSH",
            "MISREPRESENTATION",
            "FORCING_RISKY_DEALS",
            "OTHER",
          ],
        },
        description: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reportedAt: { type: Date, default: Date.now },
        action: { type: String, enum: ["WARNING", "SUSPENSION", "BLACKLIST"] },
        founderNotified: { type: Boolean, default: false },
        founderDecision: { type: String },
        resolvedAt: { type: Date },
      },
    ],

    // Bank details for commission payment
    bankDetails: {
      accountNumber: { type: String },
      accountHolderName: { type: String },
      ifsc: { type: String },
      bankName: { type: String },
      verified: { type: Boolean, default: false },
    },

    // Created by (Sales team member)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Notes
    notes: { type: String },
  },
  { timestamps: true },
);

// Index for efficient queries
// email is already indexed via unique: true in schema definition
agentSchema.index({ status: 1 });
agentSchema.index({ "introducedEpcs.epcId": 1 });

// Static method to check if agent is eligible for commission on EPC
agentSchema.statics.getEligibleAgent = async function (epcId) {
  const agent = await this.findOne({
    "introducedEpcs.epcId": epcId,
    "introducedEpcs.commissionEligible": true,
    status: { $ne: "BLACKLISTED" },
  });
  return agent;
};

// Method to record commission
agentSchema.methods.recordCommission = async function (
  epcId,
  transactionId,
  amount,
  percentage,
) {
  this.commissions.push({
    epcId,
    firstCwcId: transactionId,
    commissionAmount: amount,
    commissionPercentage: percentage,
    status: "PENDING",
  });

  this.metrics.pendingCommission += amount;

  // Mark first CWC completed
  const epcEntry = this.introducedEpcs.find(
    (e) => e.epcId.toString() === epcId.toString(),
  );
  if (epcEntry) {
    epcEntry.firstCwcCompleted = true;
  }

  await this.save();
};

module.exports = mongoose.model("Agent", agentSchema);
