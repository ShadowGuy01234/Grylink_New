const Case = require("../models/Case");

// Get all cases with filters
const getCases = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.epcId) query.epcId = filters.epcId;
  if (filters.subContractorId) query.subContractorId = filters.subContractorId;

  return Case.find(query)
    .sort({ createdAt: -1 })
    .populate(
      "billId",
      "billNumber amount fileName fileUrl mimeType uploadedAt wcc measurementSheet",
    )
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

// Update case status (used by RMT / Ops for workflow transitions)
const updateCaseStatus = async (caseId, status, userId, notes) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error("Case not found");

  const validStatuses = [
    "RMT_QUEUE", "RMT_DOCUMENT_REVIEW", "RMT_PENDING_DOCS",
    "RMT_RISK_ANALYSIS", "RMT_APPROVED", "RMT_REJECTED", "RMT_NEEDS_REVIEW",
    "CWCAF_READY", "SHARED_WITH_NBFC", "DISBURSED", "EPC_VERIFIED",
    "READY_FOR_COMPANY_REVIEW", "EPC_REJECTED",
  ];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  caseDoc.status = status;
  caseDoc.statusHistory.push({
    status,
    changedBy: userId,
    notes: notes || "",
    changedAt: new Date(),
  });
  await caseDoc.save();

  return caseDoc;
};

module.exports = {
  getCases,
  getCaseById,
  epcReviewCase,
  rmtRiskAssessment,
  updateCaseStatus,
};
