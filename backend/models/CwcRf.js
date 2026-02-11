const mongoose = require("mongoose");

const cwcRfSchema = new mongoose.Schema(
  {
    subContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubContractor",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    epcId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "KYC_REQUIRED",
        "KYC_IN_PROGRESS",
        "KYC_COMPLETED",
        "ACTION_REQUIRED",
      ],
      default: "SUBMITTED",
    },

    // Platform fee
    platformFeePaid: { type: Boolean, default: false },
    platformFeeAmount: { type: Number, default: 1000 },
    paymentReference: { type: String },

    // KYC details
    kycNotes: { type: String },
    kycCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    kycCompletedAt: { type: Date },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("CwcRf", cwcRfSchema);
