const Nbfc = require("../models/Nbfc");
const User = require("../models/User");
const Case = require("../models/Case");

// Create new NBFC
const createNbfc = async (data) => {
  const existingNbfc = await Nbfc.findOne({ code: data.code });
  if (existingNbfc) {
    throw new Error("NBFC with this code already exists");
  }

  const nbfc = new Nbfc(data);
  await nbfc.save();
  return nbfc;
};

// Get all NBFCs with optional filters
const getNbfcs = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.riskAppetite) query.riskAppetite = filters.riskAppetite;

  return await Nbfc.find(query).sort({ preferenceScore: -1 });
};

// Get NBFC by ID
const getNbfcById = async (nbfcId) => {
  const nbfc = await Nbfc.findById(nbfcId).populate("userId", "name email");
  if (!nbfc) throw new Error("NBFC not found");
  return nbfc;
};

// Update NBFC
const updateNbfc = async (nbfcId, data, userId) => {
  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) throw new Error("NBFC not found");

  Object.assign(nbfc, data);
  nbfc.statusHistory.push({
    status: nbfc.status,
    changedBy: userId,
    notes: "Updated",
  });
  await nbfc.save();
  return nbfc;
};

// NBFC Matching Engine (SOP Phase 7)
// Suggests best NBFCs based on case criteria
const matchNbfcsForCase = async (caseId) => {
  const caseDoc = await Case.findById(caseId)
    .populate("subContractorId")
    .populate("epcId")
    .populate("billId");

  if (!caseDoc) throw new Error("Case not found");

  const riskLevel = caseDoc.riskAssessment?.riskLevel || "medium";
  const amount = caseDoc.billId?.amount || 0;

  // Find matching NBFCs
  const nbfcs = await Nbfc.find({
    status: "ACTIVE",
    acceptedRiskLevels: riskLevel,
    "coverage.minDealSize": { $lte: amount },
    $or: [
      { "coverage.maxDealSize": { $gte: amount } },
      { "coverage.maxDealSize": { $exists: false } },
    ],
  }).sort({
    preferenceScore: -1,
    "metrics.approvalRate": -1,
    "interestRates.avgRate": 1,
  });

  // Score and rank NBFCs
  const rankedNbfcs = nbfcs.map((nbfc) => {
    let score = nbfc.preferenceScore;

    // Boost for higher approval rate
    score += (nbfc.metrics.approvalRate || 0) * 0.3;

    // Boost for lower interest rate
    const avgRate = nbfc.interestRates?.avgRate || 15;
    score += (20 - avgRate) * 2;

    // Boost for faster processing
    score += Math.max(0, 10 - (nbfc.metrics.avgProcessingDays || 10));

    return {
      nbfc,
      matchScore: Math.round(score),
      reasons: [
        `Approval rate: ${nbfc.metrics.approvalRate || 0}%`,
        `Avg rate: ${nbfc.interestRates?.avgRate || "N/A"}%`,
        `Processing: ${nbfc.metrics.avgProcessingDays || "N/A"} days`,
      ],
    };
  });

  return rankedNbfcs.sort((a, b) => b.matchScore - a.matchScore);
};

// Share case with multiple NBFCs (SOP - same bill can be shared with multiple NBFCs)
const shareCaseWithNbfcs = async (caseId, nbfcIds, userId) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error("Case not found");

  // Record sharing in case
  if (!caseDoc.nbfcSharing) {
    caseDoc.nbfcSharing = [];
  }

  for (const nbfcId of nbfcIds) {
    const existing = caseDoc.nbfcSharing.find(
      (s) => s.nbfcId.toString() === nbfcId,
    );
    if (!existing) {
      caseDoc.nbfcSharing.push({
        nbfcId,
        sharedAt: new Date(),
        sharedBy: userId,
        status: "SHARED",
      });
    }
  }

  await caseDoc.save();
  return caseDoc;
};

// Update NBFC metrics after deal completion
const updateNbfcMetrics = async (nbfcId, dealOutcome) => {
  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) return;

  nbfc.metrics.totalDealsProcessed += 1;

  if (dealOutcome.approved) {
    const totalApproved =
      Math.round(
        (nbfc.metrics.approvalRate * (nbfc.metrics.totalDealsProcessed - 1)) /
          100,
      ) + 1;
    nbfc.metrics.approvalRate = Math.round(
      (totalApproved / nbfc.metrics.totalDealsProcessed) * 100,
    );
  }

  if (dealOutcome.processingDays) {
    const oldTotal =
      nbfc.metrics.avgProcessingDays * (nbfc.metrics.totalDealsProcessed - 1);
    nbfc.metrics.avgProcessingDays = Math.round(
      (oldTotal + dealOutcome.processingDays) /
        nbfc.metrics.totalDealsProcessed,
    );
  }

  if (dealOutcome.amount) {
    nbfc.metrics.totalAmountDisbursed += dealOutcome.amount;
  }

  // Recalculate preference score
  nbfc.preferenceScore = calculatePreferenceScore(nbfc);
  await nbfc.save();
};

// Calculate NBFC preference score
const calculatePreferenceScore = (nbfc) => {
  let score = 50; // Base score

  // Approval rate component (max 25 points)
  score += Math.min(25, (nbfc.metrics.approvalRate || 0) * 0.25);

  // Processing speed component (max 15 points)
  const processingDays = nbfc.metrics.avgProcessingDays || 10;
  score += Math.max(0, 15 - processingDays);

  // Interest rate component (max 10 points)
  const avgRate = nbfc.interestRates?.avgRate || 15;
  score += Math.max(0, 10 - (avgRate - 10) * 0.5);

  return Math.round(Math.min(100, Math.max(0, score)));
};

// Get NBFC dashboard data
const getNbfcDashboard = async (nbfcId) => {
  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) throw new Error("NBFC not found");

  // Get cases shared with this NBFC
  const cases = await Case.find({
    "nbfcSharing.nbfc": nbfcId,
  })
    .populate("subContractorId", "companyName ownerName")
    .populate("epcId", "companyName")
    .populate("billId", "amount billNumber")
    .populate("cwcRfId")
    .sort({ createdAt: -1 });

  // Get transactions
  const Transaction = require("../models/Transaction");
  const transactions = await Transaction.find({ nbfcId })
    .populate("sellerId", "companyName")
    .populate("buyerId", "companyName")
    .sort({ createdAt: -1 });

  // Get CWCRFs pending quotation
  const CwcRf = require("../models/CwcRf");
  const pendingQuotations = await CwcRf.find({
    "nbfcQuotations.nbfcId": nbfcId,
    nbfcQuotations: {
      $elemMatch: {
        nbfcId: nbfcId,
        status: "PENDING",
      },
    },
  })
    .populate("subContractorId", "companyName")
    .populate("epcId", "companyName");

  return {
    nbfc,
    cases,
    transactions,
    pendingQuotations,
    lps: nbfc.lendingPreferenceSheet,
    stats: {
      pendingCases: cases.filter((c) =>
        c.nbfcSharing?.find(
          (s) =>
            s.nbfc?.toString() === nbfcId.toString() && s.status === "PENDING",
        ),
      ).length,
      pendingQuotes: pendingQuotations.length,
      activeTransactions: transactions.filter((t) =>
        ["DISBURSED", "AWAITING_REPAYMENT"].includes(t.status),
      ).length,
      totalDisbursed: nbfc.metrics.totalAmountDisbursed,
      monthlyCapacityUsed:
        nbfc.lendingPreferenceSheet?.monthlyCapacity?.usedAmount || 0,
      monthlyCapacityTotal:
        nbfc.lendingPreferenceSheet?.monthlyCapacity?.totalAmount || 0,
    },
  };
};

// ========================================
// LPS (Lending Preference Sheet) Management
// Workflow Section 6
// ========================================

// Update LPS for NBFC
const updateLps = async (nbfcId, lpsData, userId) => {
  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) throw new Error("NBFC not found");

  // Validate mandatory fields
  if (
    !lpsData.interestRatePolicy &&
    !nbfc.lendingPreferenceSheet?.interestRatePolicy
  ) {
    throw new Error("Interest rate policy is required");
  }

  // Build LPS structure
  nbfc.lendingPreferenceSheet = {
    ...nbfc.lendingPreferenceSheet,

    // A: Interest Rate Policy
    interestRatePolicy:
      lpsData.interestRatePolicy ||
      nbfc.lendingPreferenceSheet?.interestRatePolicy,

    // B: Risk Appetite
    riskAppetite:
      lpsData.riskAppetite || nbfc.lendingPreferenceSheet?.riskAppetite,
    acceptedRiskLevels:
      lpsData.acceptedRiskLevels ||
      nbfc.lendingPreferenceSheet?.acceptedRiskLevels,

    // C: Ticket Size
    ticketSize: lpsData.ticketSize || nbfc.lendingPreferenceSheet?.ticketSize,

    // D: Monthly Lending Capacity
    monthlyCapacity: {
      ...nbfc.lendingPreferenceSheet?.monthlyCapacity,
      totalAmount:
        lpsData.monthlyCapacity?.totalAmount ||
        nbfc.lendingPreferenceSheet?.monthlyCapacity?.totalAmount,
      availableAmount:
        (lpsData.monthlyCapacity?.totalAmount ||
          nbfc.lendingPreferenceSheet?.monthlyCapacity?.totalAmount ||
          0) - (nbfc.lendingPreferenceSheet?.monthlyCapacity?.usedAmount || 0),
    },

    // Additional preferences
    tenurePreference:
      lpsData.tenurePreference || nbfc.lendingPreferenceSheet?.tenurePreference,
    sectorPreferences:
      lpsData.sectorPreferences ||
      nbfc.lendingPreferenceSheet?.sectorPreferences,
    geographicPreferences:
      lpsData.geographicPreferences ||
      nbfc.lendingPreferenceSheet?.geographicPreferences,

    lastUpdatedAt: new Date(),
    lastUpdatedBy: userId,
  };

  // Map risk appetite to acceptedRiskLevels
  if (lpsData.riskAppetite && !lpsData.acceptedRiskLevels) {
    switch (lpsData.riskAppetite) {
      case "LOW_ONLY":
        nbfc.lendingPreferenceSheet.acceptedRiskLevels = ["LOW"];
        break;
      case "LOW_MEDIUM":
        nbfc.lendingPreferenceSheet.acceptedRiskLevels = ["LOW", "MEDIUM"];
        break;
      case "ALL_CATEGORIES":
        nbfc.lendingPreferenceSheet.acceptedRiskLevels = [
          "LOW",
          "MEDIUM",
          "HIGH",
        ];
        break;
    }
  }

  // Also update legacy fields for backward compatibility
  if (lpsData.interestRatePolicy?.flatRate) {
    nbfc.interestRates = {
      ...nbfc.interestRates,
      minRate: lpsData.interestRatePolicy.flatRate,
      maxRate: lpsData.interestRatePolicy.flatRate,
    };
  }

  nbfc.statusHistory.push({
    status: nbfc.status,
    changedBy: userId,
    notes: "LPS updated",
  });

  await nbfc.save();
  return nbfc;
};

// Get LPS for NBFC
const getLps = async (nbfcId) => {
  const nbfc = await Nbfc.findById(nbfcId).select(
    "lendingPreferenceSheet name code",
  );
  if (!nbfc) throw new Error("NBFC not found");
  return nbfc;
};

// Reset monthly capacity (called by cron at month start)
const resetMonthlyCapacity = async () => {
  const result = await Nbfc.updateMany(
    { "lendingPreferenceSheet.monthlyCapacity.totalAmount": { $exists: true } },
    {
      $set: {
        "lendingPreferenceSheet.monthlyCapacity.usedAmount": 0,
        "lendingPreferenceSheet.monthlyCapacity.lastResetAt": new Date(),
      },
    },
  );
  return result;
};

// Find NBFCs matching CWCAF criteria
const findMatchingNbfcsForCwcaf = async (cwcafData) => {
  const nbfcs = await Nbfc.find({
    status: "ACTIVE",
    activeLendingStatus: true,
  });

  return nbfcs.filter((nbfc) => {
    const lps = nbfc.lendingPreferenceSheet;
    if (!lps) return false;

    // Check risk appetite
    const riskLevel = cwcafData.riskCategory?.toUpperCase();
    if (lps.riskAppetite === "LOW_ONLY" && riskLevel !== "LOW") return false;
    if (lps.riskAppetite === "LOW_MEDIUM" && riskLevel === "HIGH") return false;

    // Check ticket size
    const amount = cwcafData.approvedAmount;
    if (lps.ticketSize?.minimum && amount < lps.ticketSize.minimum)
      return false;
    if (lps.ticketSize?.maximum && amount > lps.ticketSize.maximum)
      return false;

    // Check monthly capacity
    const available =
      (lps.monthlyCapacity?.totalAmount || 0) -
      (lps.monthlyCapacity?.usedAmount || 0);
    if (available < amount) return false;

    // Check interest rate match
    const sellerMaxRate =
      cwcafData.interestPreference?.maxAcceptableRate ||
      cwcafData.interestPreference?.maxRate;
    const nbfcMinRate =
      lps.interestRatePolicy?.minimumRate || lps.interestRatePolicy?.flatRate;
    if (sellerMaxRate && nbfcMinRate && sellerMaxRate < nbfcMinRate)
      return false;

    return true;
  });
};

module.exports = {
  createNbfc,
  getNbfcs,
  getNbfcById,
  updateNbfc,
  matchNbfcsForCase,
  shareCaseWithNbfcs,
  updateNbfcMetrics,
  getNbfcDashboard,
  // LPS Management
  updateLps,
  getLps,
  resetMonthlyCapacity,
  findMatchingNbfcsForCwcaf,
};
