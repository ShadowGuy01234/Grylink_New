const mongoose = require("mongoose");

const techPreneurRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [120, "Name too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"],
    },
    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
    },
    year: {
      type: String,
      required: [true, "Year is required"],
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    trackPreference: {
      type: String,
      required: [true, "Track preference is required"],
      enum: [
        "AI + Web Development",
        "Startup & Entrepreneurship",
        "Industry Productivity Tools",
      ],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      trim: true,
    },
    screenshotUrl: {
      type: String,
      required: [true, "Payment screenshot is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message too long"],
    },
    feeAmount: {
      type: Number,
      required: true,
      enum: [799, 999, 1299],
    },
    registrationPhase: {
      type: String,
      required: true,
      enum: ["early", "standard", "late", "upcoming", "closed"],
    },
    // Admin-managed fields
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    paymentVerifiedBy: {
      type: String,
    },
    paymentVerifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },
    assignedSPOC: {
      type: String,
    },
    assignedGroup: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate emails
techPreneurRegistrationSchema.index({ email: 1 }, { unique: true });
techPreneurRegistrationSchema.index({ phone: 1 });
techPreneurRegistrationSchema.index({ trackPreference: 1 });
techPreneurRegistrationSchema.index({ status: 1 });
techPreneurRegistrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "TechPreneurRegistration",
  techPreneurRegistrationSchema
);
