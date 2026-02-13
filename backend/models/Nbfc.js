const mongoose = require("mongoose");

const nbfcSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true }, // Short code like 'HDFC', 'ICICI'
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    // Registration details
    cin: { type: String, trim: true },
    rbiLicense: { type: String, trim: true }, // RBI Registration Number

    // ========================================
    // LENDING PREFERENCE SHEET (LPS)
    // Workflow Section 6 - Filled Once, Editable Anytime
    // ========================================
    lendingPreferenceSheet: {
      // A: Interest Rate Policy
      interestRatePolicy: {
        policyType: {
          type: String,
          enum: ["FLAT_RATE", "RISK_BASED", "MINIMUM_RATE"],
        },
        flatRate: { type: Number }, // Annual % (e.g., 20)

        // Risk-based rates
        lowRiskRate: { type: Number }, // e.g., 16-18%
        lowRiskRateMax: { type: Number },
        mediumRiskRate: { type: Number }, // e.g., 18-22%
        mediumRiskRateMax: { type: Number },
        highRiskRate: { type: Number }, // e.g., 22-26%
        highRiskRateMax: { type: Number },

        minimumRate: { type: Number }, // Minimum acceptable rate (e.g., 22)
      },

      // B: Risk Appetite
      riskAppetite: {
        type: String,
        enum: ["LOW_ONLY", "LOW_MEDIUM", "ALL_CATEGORIES"],
        default: "LOW_MEDIUM",
      },
      acceptedRiskLevels: [
        {
          type: String,
          enum: ["LOW", "MEDIUM", "HIGH"],
        },
      ],

      // C: Ticket Size
      ticketSize: {
        minimum: { type: Number, default: 2500000 }, // ₹25 Lakhs
        maximum: { type: Number, default: 200000000 }, // ₹2 Crores
      },

      // D: Monthly Lending Capacity
      monthlyCapacity: {
        totalAmount: { type: Number }, // e.g., 10 Crores
        usedAmount: { type: Number, default: 0 },
        availableAmount: { type: Number },
        lastResetAt: { type: Date },
      },

      // Additional preferences
      tenurePreference: {
        minDays: { type: Number, default: 30 },
        maxDays: { type: Number, default: 90 },
        preferredTenures: [{ type: Number }], // [30, 45, 60, 90]
      },

      // Sector preferences
      sectorPreferences: [
        {
          type: String,
          enum: [
            "CONSTRUCTION",
            "INFRASTRUCTURE",
            "ROADS",
            "BRIDGES",
            "WATER",
            "POWER",
            "REAL_ESTATE",
            "OTHER",
          ],
        },
      ],

      // Geographic preferences
      geographicPreferences: [
        {
          type: String, // State names
        },
      ],

      lastUpdatedAt: { type: Date },
      lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Legacy fields (for backward compatibility)
    coverage: {
      geographies: [{ type: String }],
      sectors: [{ type: String }],
      minDealSize: { type: Number, default: 0 },
      maxDealSize: { type: Number },
    },

    riskAppetite: {
      type: String,
      enum: ["conservative", "moderate", "aggressive"],
      default: "moderate",
    },
    acceptedRiskLevels: [{ type: String, enum: ["low", "medium", "high"] }],

    // Performance metrics (auto-updated)
    metrics: {
      approvalRate: { type: Number, default: 0 },
      avgProcessingDays: { type: Number, default: 0 },
      totalDealsProcessed: { type: Number, default: 0 },
      totalAmountDisbursed: { type: Number, default: 0 },
      avgInterestRate: { type: Number, default: 0 },
    },

    // Interest rate range (legacy)
    interestRates: {
      minRate: { type: Number },
      maxRate: { type: Number },
      avgRate: { type: Number },
    },

    // Preference score (auto-calculated by Tech Engine)
    preferenceScore: { type: Number, default: 50 },

    // Contact persons
    contacts: [
      {
        name: String,
        designation: String,
        email: String,
        phone: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // Credit Team Contact (Workflow Section 6)
    creditTeamContact: {
      name: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true },
      designation: { type: String, trim: true },
    },

    // Active lending status
    activeLendingStatus: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    // User account for NBFC portal access
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 2FA requirement for NBFC users
    requires2FA: { type: Boolean, default: true },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
      },
    ],
  },
  { timestamps: true },
);

// Index for efficient filtering
nbfcSchema.index({
  "coverage.geographies": 1,
  "coverage.sectors": 1,
  status: 1,
});
nbfcSchema.index({ preferenceScore: -1, status: 1 });
nbfcSchema.index({ "lendingPreferenceSheet.riskAppetite": 1, status: 1 });
nbfcSchema.index({ activeLendingStatus: 1, status: 1 });

// Method to check if CWCAF matches LPS criteria
nbfcSchema.methods.matchesLps = function (cwcaf) {
  const lps = this.lendingPreferenceSheet;
  if (!lps) return false;

  // Check risk appetite match
  const riskLevel = cwcaf.riskCategory;
  if (lps.riskAppetite === "LOW_ONLY" && riskLevel !== "LOW") return false;
  if (lps.riskAppetite === "LOW_MEDIUM" && riskLevel === "HIGH") return false;

  // Check ticket size
  const amount = cwcaf.approvedAmount;
  if (lps.ticketSize?.minimum && amount < lps.ticketSize.minimum) return false;
  if (lps.ticketSize?.maximum && amount > lps.ticketSize.maximum) return false;

  // Check monthly capacity
  const available =
    (lps.monthlyCapacity?.totalAmount || 0) -
    (lps.monthlyCapacity?.usedAmount || 0);
  if (available < amount) return false;

  // Check interest rate match
  const sellerMaxRate =
    cwcaf.interestPreference?.maxAcceptableRate ||
    cwcaf.interestPreference?.maxRate;
  const nbfcMinRate =
    lps.interestRatePolicy?.minimumRate || lps.interestRatePolicy?.flatRate;
  if (sellerMaxRate && nbfcMinRate && sellerMaxRate < nbfcMinRate) return false;

  return true;
};

// Method to update monthly capacity
nbfcSchema.methods.updateMonthlyCapacity = async function (
  amount,
  isDeduct = true,
) {
  const lps = this.lendingPreferenceSheet;
  if (!lps?.monthlyCapacity) return;

  if (isDeduct) {
    lps.monthlyCapacity.usedAmount =
      (lps.monthlyCapacity.usedAmount || 0) + amount;
  }
  lps.monthlyCapacity.availableAmount =
    (lps.monthlyCapacity.totalAmount || 0) -
    (lps.monthlyCapacity.usedAmount || 0);

  await this.save();
};

module.exports = mongoose.model("Nbfc", nbfcSchema);
