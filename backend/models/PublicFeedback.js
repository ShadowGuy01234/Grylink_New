const mongoose = require("mongoose");

const publicFeedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bug", "idea", "question"],
      required: true,
      default: "idea",
    },
    roleContext: {
      type: String,
      enum: ["subcontractor", "epc", "nbfc", "unknown"],
      default: "unknown",
    },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    pagePath: { type: String, trim: true, maxlength: 500 },
    pageTitle: { type: String, trim: true, maxlength: 500 },
    name: { type: String, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["new", "in_review", "resolved", "closed"],
      default: "new",
    },
    source: { type: String, default: "public_site" },
    metadata: {
      sessionId: { type: String, trim: true, maxlength: 120 },
      referrer: { type: String, trim: true, maxlength: 500 },
      userAgent: { type: String, trim: true, maxlength: 1000 },
      ipAddress: { type: String, trim: true, maxlength: 120 },
    },
  },
  { timestamps: true },
);

publicFeedbackSchema.index({ status: 1, createdAt: -1 });
publicFeedbackSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("PublicFeedback", publicFeedbackSchema);
