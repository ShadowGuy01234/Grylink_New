const crypto = require("crypto");
const mongoose = require("mongoose");

const chatConversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 120,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: {
      type: String,
      default: "public",
      trim: true,
      maxlength: 64,
    },
    portal: {
      type: String,
      default: "public",
      trim: true,
      maxlength: 120,
    },
    encryptedHistory: { type: String, default: "" },
    historyHash: { type: String, default: "" },
    messageCount: { type: Number, default: 0 },
    lastLanguage: {
      type: String,
      default: "en",
      trim: true,
      maxlength: 24,
    },
    metadata: {
      ipAddress: { type: String, trim: true, maxlength: 120 },
      userAgent: { type: String, trim: true, maxlength: 1000 },
    },
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

chatConversationSchema.index({ userId: 1, updatedAt: -1 });
chatConversationSchema.index({ portal: 1, updatedAt: -1 });

chatConversationSchema.methods.computeHistoryHash = function computeHistoryHash() {
  const value = String(this.encryptedHistory || "");
  return crypto.createHash("sha256").update(value).digest("hex");
};

module.exports = mongoose.model("ChatConversation", chatConversationSchema);
