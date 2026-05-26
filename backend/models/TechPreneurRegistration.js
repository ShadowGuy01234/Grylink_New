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
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
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
      trim: true,
    },
    screenshotUrl: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message too long"],
    },
    feeAmount: {
      type: Number,
      required: true,
    },
    registrationPhase: {
      type: String,
      required: true,
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
    // Dashboard access — enabled by admin after payment verification
    dashboardAccess: {
      type: Boolean,
      default: false,
    },
    // Unique referral code assigned after payment confirmed
    referralCode: {
      type: String,
      trim: true,
    },
    // Referral code this student used at checkout
    usedReferralCode: {
      type: String,
      trim: true,
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
