const Nbfc = require('../models/Nbfc');
const User = require('../models/User');
const Case = require('../models/Case');

// Create new NBFC
const createNbfc = async (data) => {
  const existingNbfc = await Nbfc.findOne({ code: data.code });
  if (existingNbfc) {
    throw new Error('NBFC with this code already exists');
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
  const nbfc = await Nbfc.findById(nbfcId).populate('userId', 'name email');
  if (!nbfc) throw new Error('NBFC not found');
  return nbfc;
};

// Update NBFC
const updateNbfc = async (nbfcId, data, userId) => {
  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) throw new Error('NBFC not found');

  Object.assign(nbfc, data);
  nbfc.statusHistory.push({
    status: nbfc.status,
    changedBy: userId,
    notes: 'Updated',
  });
  await nbfc.save();
  return nbfc;
};

// NBFC Matching Engine (SOP Phase 7)
// Suggests best NBFCs based on case criteria
const matchNbfcsForCase = async (caseId) => {
  const caseDoc = await Case.findById(caseId)
    .populate('subContractorId')
    .populate('epcId')
    .populate('billId');

  if (!caseDoc) throw new Error('Case not found');

  const riskLevel = caseDoc.riskAssessment?.riskLevel || 'medium';
  const amount = caseDoc.billId?.amount || 0;

  // Find matching NBFCs
  const nbfcs = await Nbfc.find({
    status: 'ACTIVE',
    acceptedRiskLevels: riskLevel,
    'coverage.minDealSize': { $lte: amount },
    $or: [
      { 'coverage.maxDealSize': { $gte: amount } },
      { 'coverage.maxDealSize': { $exists: false } },
    ],
  }).sort({ preferenceScore: -1, 'metrics.approvalRate': -1, 'interestRates.avgRate': 1 });

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
        `Avg rate: ${nbfc.interestRates?.avgRate || 'N/A'}%`,
        `Processing: ${nbfc.metrics.avgProcessingDays || 'N/A'} days`,
      ],
    };
  });

  return rankedNbfcs.sort((a, b) => b.matchScore - a.matchScore);
};

// Share case with multiple NBFCs (SOP - same bill can be shared with multiple NBFCs)
const shareCaseWithNbfcs = async (caseId, nbfcIds, userId) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error('Case not found');

  // Record sharing in case
  if (!caseDoc.nbfcSharing) {
    caseDoc.nbfcSharing = [];
  }

  for (const nbfcId of nbfcIds) {
    const existing = caseDoc.nbfcSharing.find(
      (s) => s.nbfcId.toString() === nbfcId
    );
    if (!existing) {
      caseDoc.nbfcSharing.push({
        nbfcId,
        sharedAt: new Date(),
        sharedBy: userId,
        status: 'SHARED',
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
    const totalApproved = Math.round(
      (nbfc.metrics.approvalRate * (nbfc.metrics.totalDealsProcessed - 1)) / 100
    ) + 1;
    nbfc.metrics.approvalRate = Math.round(
      (totalApproved / nbfc.metrics.totalDealsProcessed) * 100
    );
  }

  if (dealOutcome.processingDays) {
    const oldTotal = nbfc.metrics.avgProcessingDays * (nbfc.metrics.totalDealsProcessed - 1);
    nbfc.metrics.avgProcessingDays = Math.round(
      (oldTotal + dealOutcome.processingDays) / nbfc.metrics.totalDealsProcessed
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
  if (!nbfc) throw new Error('NBFC not found');

  // Get cases shared with this NBFC
  const cases = await Case.find({
    'nbfcSharing.nbfcId': nbfcId,
  })
    .populate('subContractorId', 'companyName ownerName')
    .populate('epcId', 'companyName')
    .populate('billId', 'amount billNumber')
    .sort({ createdAt: -1 });

  // Get transactions
  const Transaction = require('../models/Transaction');
  const transactions = await Transaction.find({ nbfcId })
    .populate('sellerId', 'companyName')
    .populate('buyerId', 'companyName')
    .sort({ createdAt: -1 });

  return {
    nbfc,
    cases,
    transactions,
    stats: {
      pendingCases: cases.filter((c) => c.nbfcSharing?.find((s) => s.nbfcId.toString() === nbfcId && s.status === 'SHARED')).length,
      activeTransactions: transactions.filter((t) => ['DISBURSED', 'AWAITING_REPAYMENT'].includes(t.status)).length,
      totalDisbursed: nbfc.metrics.totalAmountDisbursed,
    },
  };
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
};
