const mongoose = require("mongoose");

const techPreneurSettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always "global"
    key: { type: String, default: "global", unique: true },
    registrationOpen: { type: Boolean, default: true },
    maintenanceMessage: {
      type: String,
      default: "We're doing some maintenance on the payment system. Registration will be back shortly!",
    },
  },
  { timestamps: true }
);

/**
 * Get (or create) the singleton settings document.
 */
techPreneurSettingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) {
    doc = await this.create({ key: "global" });
  }
  return doc;
};

module.exports = mongoose.model("TechPreneurSettings", techPreneurSettingsSchema);
