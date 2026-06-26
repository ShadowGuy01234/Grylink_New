const mongoose = require("mongoose");

const techPreneurCertificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
      required: true
    },
    studentEmail: { type: String, required: true, lowercase: true },
    studentName: { type: String, required: true },
    college: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurCertificateTemplate"
    },
    
    // Scores out of 100
    scores: {
      week1: { type: Number, default: 0 },
      week2: { type: Number, default: 0 },
      week3: { type: Number, default: 0 },
      week4: { type: Number, default: 0 },
      projectContribution: { type: Number, default: 0 }
    },
    
    // Effort descriptions
    efforts: {
      week1: { type: String, default: "" },
      week2: { type: String, default: "" },
      week3: { type: String, default: "" },
      week4: { type: String, default: "" },
      projectContribution: { type: String, default: "" }
    },
    
    finalRemarks: { type: String, default: "" }
  },
  { timestamps: true }
);

// Indexes for fast lookup
techPreneurCertificateSchema.index({ studentEmail: 1 });
techPreneurCertificateSchema.index({ certificateId: 1 }, { unique: true });

module.exports = mongoose.model(
  "TechPreneurCertificate",
  techPreneurCertificateSchema
);
