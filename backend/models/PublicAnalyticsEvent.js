const mongoose = require("mongoose");

const publicAnalyticsEventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, trim: true, maxlength: 120 },
    roleContext: {
      type: String,
      enum: ["subcontractor", "epc", "nbfc", "general", "unknown"],
      default: "unknown",
    },
    pagePath: { type: String, trim: true, maxlength: 500 },
    pageTitle: { type: String, trim: true, maxlength: 500 },
    sessionId: { type: String, trim: true, maxlength: 120 },
    source: { type: String, default: "public_site" },
    properties: { type: mongoose.Schema.Types.Mixed },
    metadata: {
      referrer: { type: String, trim: true, maxlength: 500 },
      userAgent: { type: String, trim: true, maxlength: 1000 },
      ipAddress: { type: String, trim: true, maxlength: 120 },
    },
  },
  { timestamps: true },
);

publicAnalyticsEventSchema.index({ eventName: 1, createdAt: -1 });
publicAnalyticsEventSchema.index({ createdAt: -1 });
publicAnalyticsEventSchema.index({ roleContext: 1, createdAt: -1 });

module.exports = mongoose.model("PublicAnalyticsEvent", publicAnalyticsEventSchema);
