const mongoose = require("mongoose");

const techPreneurSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["daily", "guest", "opening", "special"],
      default: "daily",
    },
    week: { type: Number }, // week number in program
    sessionDate: { type: Date },
    startTime: { type: String, required: true }, // "10:00 AM"
    endTime: { type: String, required: true },   // "11:00 AM"
    meetLink: { type: String, trim: true },
    guestName: { type: String, trim: true },
    guestDesignation: { type: String, trim: true },
    description: { type: String, trim: true },
    targetTrack: {
      type: String,
      enum: ["all", "AI + Web Development", "Startup & Entrepreneurship", "Industry Productivity Tools"],
      default: "all",
    },
    isPublished: { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false }, // for guest sessions
  },
  { timestamps: true }
);

techPreneurSessionSchema.index({ sessionDate: 1 });
techPreneurSessionSchema.index({ isPublished: 1 });

module.exports = mongoose.model("TechPreneurSession", techPreneurSessionSchema);
