const mongoose = require("mongoose");

const techPreneurCertificateTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    // Array of variable positions (saved as percentages 0-100)
    variables: [
      {
        name: { type: String, required: true }, // name, college, date, certId, qrCode
        x: { type: Number, required: true }, // percentage from left
        y: { type: Number, required: true }, // percentage from top
        fontSize: { type: Number, default: 24 },
        fontColor: { type: String, default: "#000000" },
        fontFamily: { type: String, default: "Inter" },
        align: { type: String, default: "center" }
      }
    ],
    isActive: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "TechPreneurCertificateTemplate",
  techPreneurCertificateTemplateSchema
);
