const mongoose = require("mongoose");

const techPreneurPromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      required: [true, "Discount amount is required"],
      enum: [300, 500], // 300 off or 500 off as requested
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    usedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechPreneurRegistration",
    },
    usedAt: {
      type: Date,
    },
    createdBy: {
      type: String, // email of the admin who created it
    },
  },
  { timestamps: true }
);

techPreneurPromoCodeSchema.index({ isUsed: 1 });

module.exports = mongoose.model("TechPreneurPromoCode", techPreneurPromoCodeSchema);
