const mongoose = require("mongoose");

const techPreneurProjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
      required: true,
    },
    studentEmail: { type: String, required: true, lowercase: true },
    studentName: { type: String },
    track: { type: String },
    githubUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https:\/\/github\.com\/.+/.test(v),
        message: "Must be a valid GitHub URL",
      },
    },
    driveUrl: { type: String, trim: true },
    projectTitle: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "submitted", "reviewed", "approved"],
      default: "submitted",
    },
    feedback: { type: String, trim: true },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

techPreneurProjectSchema.index({ studentId: 1 });
techPreneurProjectSchema.index({ status: 1 });
techPreneurProjectSchema.index({ track: 1 });

module.exports = mongoose.model("TechPreneurProject", techPreneurProjectSchema);
