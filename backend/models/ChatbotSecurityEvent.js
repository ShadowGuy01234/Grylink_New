const mongoose = require("mongoose");

const chatbotSecurityEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    sessionId: { type: String, trim: true, maxlength: 120, index: true },
    userRole: { type: String, default: "public", trim: true, maxlength: 40, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    prompt: { type: String, trim: true, maxlength: 1500 },
    issues: [{ type: String, trim: true, maxlength: 80 }],
    blocked: { type: Boolean, default: false },
    reason: { type: String, trim: true, maxlength: 1200 },
    ipAddress: { type: String, trim: true, maxlength: 120 },
    userAgent: { type: String, trim: true, maxlength: 1000 },
    country: { type: String, trim: true, maxlength: 8 },
    deviceType: { type: String, trim: true, maxlength: 24 },
    browser: { type: String, trim: true, maxlength: 60 },
    path: { type: String, trim: true, maxlength: 300 },
    method: { type: String, trim: true, maxlength: 12 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

chatbotSecurityEventSchema.index({ eventType: 1, createdAt: -1 });
chatbotSecurityEventSchema.index({ severity: 1, createdAt: -1 });
chatbotSecurityEventSchema.index({ userRole: 1, createdAt: -1 });
chatbotSecurityEventSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatbotSecurityEvent", chatbotSecurityEventSchema);
