const mongoose = require("mongoose");

const techPreneurReferralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
      required: true,
    },
    referrerEmail: { type: String, required: true, lowercase: true },
    referrerCode: { type: String, required: true },
    referredEmail: { type: String, required: true, lowercase: true },
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
    },
    status: {
      type: String,
      enum: ["pending", "registered", "paid", "verified"],
      default: "pending",
    },
    discountApplied: { type: Number, default: 200 }, // ₹200 discount for referred user
    cashbackStatus: {
      type: String,
      enum: ["not_eligible", "eligible", "paid"],
      default: "not_eligible",
    },
    cashbackAmount: { type: Number, default: 0 },
    cashbackPaidAt: { type: Date },
    cashbackPaidBy: { type: String },
  },
  { timestamps: true }
);

techPreneurReferralSchema.index({ referrerId: 1 });
techPreneurReferralSchema.index({ referrerCode: 1 });
techPreneurReferralSchema.index({ referredEmail: 1 });

module.exports = mongoose.model("TechPreneurReferral", techPreneurReferralSchema);
