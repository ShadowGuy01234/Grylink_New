const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    subContractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubContractor",
      required: true,
    },
    epcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    cwcRfId: { type: mongoose.Schema.Types.ObjectId, ref: "CwcRf" },

    caseNumber: { type: String, unique: true },

    status: {
      type: String,
      enum: [
        "READY_FOR_COMPANY_REVIEW",
        "EPC_REJECTED",
        "EPC_VERIFIED",
        "RMT_APPROVED",
        "RMT_REJECTED",
        "RMT_NEEDS_REVIEW",
        "BID_PLACED",
        "NEGOTIATION_IN_PROGRESS",
        "COMMERCIAL_LOCKED",
      ],
      default: "READY_FOR_COMPANY_REVIEW",
    },

    // EPC review
    epcReviewNotes: { type: String },
    epcReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    epcReviewedAt: { type: Date },

    // RMT Risk Assessment
    riskAssessment: {
      riskScore: { type: Number },
      riskLevel: { type: String, enum: ["low", "medium", "high", "critical"] },
      assessment: { type: String },
      recommendation: {
        type: String,
        enum: ["approve", "reject", "needs_review"],
      },
      notes: { type: String },
      assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assessedAt: { type: Date },
    },

    // Commercial lock snapshot
    commercialSnapshot: { type: mongoose.Schema.Types.Mixed },
    lockedAt: { type: Date },

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

// Auto-generate case number
caseSchema.pre("save", async function (next) {
  if (!this.caseNumber) {
    const count = await mongoose.model("Case").countDocuments();
    this.caseNumber = `GRY-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Case", caseSchema);
