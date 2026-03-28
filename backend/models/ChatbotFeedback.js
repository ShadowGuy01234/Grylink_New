const mongoose = require("mongoose");

const chatbotFeedbackSchema = new mongoose.Schema(
  {
    sessionId: { type: String, trim: true, maxlength: 120, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    role: { type: String, default: "public", trim: true, maxlength: 64 },
    portal: { type: String, default: "public", trim: true, maxlength: 120 },
    messageId: { type: String, trim: true, maxlength: 120 },
    rating: {
      type: String,
      required: true,
      enum: ["helpful", "not_helpful"],
      index: true,
    },
    reason: { type: String, trim: true, maxlength: 1200 },
    question: { type: String, trim: true, maxlength: 4000 },
    answerExcerpt: { type: String, trim: true, maxlength: 4000 },
    language: { type: String, default: "en", trim: true, maxlength: 24 },
    metadata: {
      ipAddress: { type: String, trim: true, maxlength: 120 },
      userAgent: { type: String, trim: true, maxlength: 1000 },
      source: { type: String, trim: true, maxlength: 120 },
    },
  },
  { timestamps: true },
);

chatbotFeedbackSchema.index({ rating: 1, createdAt: -1 });
chatbotFeedbackSchema.index({ portal: 1, createdAt: -1 });
chatbotFeedbackSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatbotFeedback", chatbotFeedbackSchema);
