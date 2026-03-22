const mongoose = require("mongoose");

const publicLeadSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["contact_form", "early_access", "career_apply", "other"],
      required: true,
    },
    roleInterest: {
      type: String,
      enum: ["subcontractor", "epc", "nbfc", "general", "unknown"],
      default: "general",
    },
    name: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 200 },
    subject: { type: String, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["new", "qualified", "contacted", "closed"],
      default: "new",
    },
    pagePath: { type: String, trim: true, maxlength: 500 },
    pageTitle: { type: String, trim: true, maxlength: 500 },
    metadata: {
      sessionId: { type: String, trim: true, maxlength: 120 },
      referrer: { type: String, trim: true, maxlength: 500 },
      userAgent: { type: String, trim: true, maxlength: 1000 },
      ipAddress: { type: String, trim: true, maxlength: 120 },
    },
  },
  { timestamps: true },
);

publicLeadSchema.index({ source: 1, createdAt: -1 });
publicLeadSchema.index({ status: 1, createdAt: -1 });
publicLeadSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("PublicLead", publicLeadSchema);
