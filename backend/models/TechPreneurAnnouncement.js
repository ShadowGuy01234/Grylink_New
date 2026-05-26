const mongoose = require("mongoose");

const techPreneurAnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["general", "session", "assignment", "emergency", "event"],
      default: "general",
    },
    targetTrack: {
      type: String,
      enum: ["all", "AI + Web Development", "Startup & Entrepreneurship", "Industry Productivity Tools"],
      default: "all",
    },
    isPinned: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    publishedBy: { type: String },
  },
  { timestamps: true }
);

techPreneurAnnouncementSchema.index({ createdAt: -1 });
techPreneurAnnouncementSchema.index({ isPublished: 1, isPinned: -1 });

module.exports = mongoose.model("TechPreneurAnnouncement", techPreneurAnnouncementSchema);
