const mongoose = require("mongoose");

const techPreneurOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
techPreneurOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
techPreneurOTPSchema.index({ email: 1 });

module.exports = mongoose.model("TechPreneurOTP", techPreneurOTPSchema);
