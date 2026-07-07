const mongoose = require("mongoose");

const techPreneurJoiningLetterSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
      required: true
    },
    studentEmail: { type: String, required: true, lowercase: true },
    studentName: { type: String, required: true },
    college: { type: String, required: true },
    joiningLetterId: { type: String, required: true, unique: true },
    joiningDate: { type: Date, default: Date.now },
    issuedAt: { type: Date, default: Date.now },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurJoiningLetterTemplate"
    },
    variablesData: {
      type: Map,
      of: String,
      default: {}
    },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for fast lookup
techPreneurJoiningLetterSchema.index({ studentEmail: 1 });
techPreneurJoiningLetterSchema.index({ joiningLetterId: 1 }, { unique: true });

module.exports = mongoose.model(
  "TechPreneurJoiningLetter",
  techPreneurJoiningLetterSchema
);
