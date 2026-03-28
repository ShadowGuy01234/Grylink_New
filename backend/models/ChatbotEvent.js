const mongoose = require("mongoose");

const chatbotEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    userRole: { type: String, default: "public", trim: true, maxlength: 40, index: true },
    sessionId: { type: String, trim: true, maxlength: 120, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    messageId: { type: String, trim: true, maxlength: 160 },
    conversationId: { type: String, trim: true, maxlength: 160 },
    responseType: { type: String, trim: true, maxlength: 40, default: "general" },
    confidenceScore: { type: Number, default: 0, min: 0, max: 1 },
    fallbackTriggered: { type: Boolean, default: false },
    retrievalCount: { type: Number, default: 0 },
    usedCache: { type: Boolean, default: false, index: true },
    responseTimeMs: { type: Number, default: 0 },
    language: { type: String, trim: true, maxlength: 24, default: "en" },
    proactivePromptId: { type: String, trim: true, maxlength: 120 },
    attachmentCount: { type: Number, default: 0 },
    containsPII: { type: Boolean, default: false },
    piiCount: { type: Number, default: 0 },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    llmModel: { type: String, trim: true, maxlength: 120 },
    embeddingModel: { type: String, trim: true, maxlength: 120 },
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

chatbotEventSchema.index({ eventType: 1, createdAt: -1 });
chatbotEventSchema.index({ userRole: 1, createdAt: -1 });
chatbotEventSchema.index({ sessionId: 1, createdAt: -1 });
chatbotEventSchema.index({ usedCache: 1, createdAt: -1 });

module.exports = mongoose.model("ChatbotEvent", chatbotEventSchema);
