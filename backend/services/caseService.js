const Case = require("../models/Case");

// Get all cases with filters
const getCases = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.epcId) query.epcId = filters.epcId;
  if (filters.subContractorId) query.subContractorId = filters.subContractorId;

  return Case.find(query)
    .sort({ createdAt: -1 })
    .populate("billId", "billNumber amount fileName")
    .populate("subContractorId", "companyName contactName")
    .populate("epcId", "companyName");
};

// Get single case with full details
const getCaseById = async (caseId) => {
  const caseDoc = await Case.findById(caseId)
    .populate("billId")
    .populate("subContractorId")
    .populate("epcId")
    .populate("cwcRfId")
    .populate("epcReviewedBy", "name email");

  if (!caseDoc) throw new Error("Case not found");
  return caseDoc;
};

// Step 16: EPC reviews case/bill
const epcReviewCase = async (caseId, decision, notes, userId) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error("Case not found");
  if (caseDoc.status !== "READY_FOR_COMPANY_REVIEW")
    throw new Error("Case is not ready for company review");

  if (decision === "approve") {
    caseDoc.status = "EPC_VERIFIED";
  } else {
    caseDoc.status = "EPC_REJECTED";
  }

  caseDoc.epcReviewNotes = notes;
  caseDoc.epcReviewedBy = userId;
  caseDoc.epcReviewedAt = new Date();
  caseDoc.statusHistory.push({
    status: caseDoc.status,
    changedBy: userId,
    notes,
  });
  await caseDoc.save();

  return caseDoc;
};

// RMT Risk Assessment
const rmtRiskAssessment = async (caseId, assessmentData, userId) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error("Case not found");
  if (caseDoc.status !== "EPC_VERIFIED")
    throw new Error("Case must be EPC verified before risk assessment");

  caseDoc.riskAssessment = {
    riskScore: assessmentData.riskScore,
    riskLevel: assessmentData.riskLevel,
    assessment: assessmentData.assessment,
    recommendation: assessmentData.recommendation,
    notes: assessmentData.notes,
    assessedBy: userId,
    assessedAt: new Date(),
  };

  if (assessmentData.recommendation === "approve") {
    caseDoc.status = "RMT_APPROVED";
  } else if (assessmentData.recommendation === "reject") {
    caseDoc.status = "RMT_REJECTED";
  } else {
    caseDoc.status = "RMT_NEEDS_REVIEW";
  }

  caseDoc.statusHistory.push({
    status: caseDoc.status,
    changedBy: userId,
    notes: assessmentData.notes,
  });
  await caseDoc.save();

  return caseDoc;
};

module.exports = {
  getCases,
  getCaseById,
  epcReviewCase,
  rmtRiskAssessment,
};
