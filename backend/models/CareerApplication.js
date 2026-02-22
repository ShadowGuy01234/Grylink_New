const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    // Applicant info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    // Role applied for
    role: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    // Experience and details
    experience: { type: String, required: true }, // e.g. "3 years"
    currentCompany: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    // Cover message
    coverLetter: { type: String, trim: true },
    // Resume — stored as cloudinary URL or plain link
    resumeUrl: { type: String, trim: true },
    // Admin tracking
    status: {
      type: String,
      enum: ["new", "reviewed", "interview", "rejected", "hired"],
      default: "new",
    },
    adminNotes: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
