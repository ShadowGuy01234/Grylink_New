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
    
    // Team Features
    teamName: { type: String, trim: true },
    teamCode: { type: String, unique: true, sparse: true, trim: true },
    theme: { type: String, trim: true },
    customThemeProblem: { type: String, trim: true },
    teamMembers: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        techId: { type: String },
      }
    ],

    // Daily Submissions
    submissions: {
      day1: {
        teamName: String,
        theme: String,
        customThemeProblem: String,
        members: Array,
        submittedAt: Date
      },
      day2: {
        prdUrl: String,
        submittedAt: Date
      },
      day3: {
        githubUrl: String,
        submittedAt: Date
      },
      day4: {
        pitchDeckUrl: String,
        submittedAt: Date
      },
      day5: {
        mvpVideoUrl: String,
        midReportUrl: String,
        submittedAt: Date
      },
      day6: {
        businessSlidesUrl: String,
        submittedAt: Date
      },
      day7: {
        finalMvpUrl: String,
        finalPitchDeckUrl: String,
        finalReportUrl: String,
        portfolios: [
          {
            email: String,
            portfolioUrl: String
          }
        ],
        submittedAt: Date
      }
    },

    // Daily Statuses
    dailyStatus: {
      day1: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day2: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day3: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day4: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day5: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day6: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" },
      day7: { type: String, enum: ["pending", "submitted", "reviewed", "approved"], default: "pending" }
    },

    // Daily Feedbacks
    dailyFeedback: {
      day1: { type: String, default: "" },
      day2: { type: String, default: "" },
      day3: { type: String, default: "" },
      day4: { type: String, default: "" },
      day5: { type: String, default: "" },
      day6: { type: String, default: "" },
      day7: { type: String, default: "" }
    },

    // Legacy fields for backward compatibility
    githubUrl: { type: String, trim: true },
    driveUrl: { type: String, trim: true },
    projectTitle: { type: String, trim: true },
    description: { type: String, trim: true },
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
techPreneurProjectSchema.index({ studentEmail: 1 });
techPreneurProjectSchema.index({ teamCode: 1 });
techPreneurProjectSchema.index({ "teamMembers.email": 1 });
techPreneurProjectSchema.index({ status: 1 });
techPreneurProjectSchema.index({ track: 1 });

module.exports = mongoose.model("TechPreneurProject", techPreneurProjectSchema);
