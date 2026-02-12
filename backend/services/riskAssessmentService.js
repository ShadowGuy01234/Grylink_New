const SellerRiskAssessment = require('../models/SellerRiskAssessment');
const SubContractor = require('../models/SubContractor');
const Blacklist = require('../models/Blacklist');
const ApprovalRequest = require('../models/ApprovalRequest');

// Create risk assessment for seller (RMT pre-screening)
const createRiskAssessment = async (sellerId, assessorId) => {
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error('Seller not found');

  // Check blacklist first
  const isBlacklisted = await Blacklist.isBlacklisted({
    pan: seller.pan,
    gstin: seller.gstin,
    email: seller.email,
  });
  if (isBlacklisted) {
    throw new Error('Seller is blacklisted and cannot be onboarded');
  }

  const assessment = new SellerRiskAssessment({
    seller: sellerId,
    assessedBy: assessorId,
    status: 'IN_PROGRESS',
    checklist: {
      companyVerification: { verified: false },
      addressVerification: { verified: false },
      financialHealthCheck: { verified: false },
      pastTrackRecord: { verified: false },
      keyPersonnelCheck: { verified: false },
      blacklistCheck: { verified: true, notes: 'Auto-checked: Not blacklisted' },
      industryClearance: { verified: false },
    },
    riskScore: 0,
    riskCategory: 'MEDIUM',
  });
  await assessment.save();

  // Update seller status
  seller.status = 'RMT_PENDING';
  seller.riskAssessmentId = assessment._id;
  await seller.save();

  return assessment;
};

// Update checklist item
const updateChecklistItem = async (assessmentId, itemKey, data, userId) => {
  const assessment = await SellerRiskAssessment.findById(assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  if (!assessment.checklist[itemKey]) {
    throw new Error('Invalid checklist item');
  }

  assessment.checklist[itemKey] = {
    verified: data.verified,
    notes: data.notes,
    verifiedAt: data.verified ? new Date() : null,
    verifiedBy: data.verified ? userId : null,
    documents: data.documents || [],
  };

  // Recalculate risk score
  assessment.riskScore = calculateRiskScore(assessment.checklist);
  assessment.riskCategory = categorizeRisk(assessment.riskScore);

  await assessment.save();
  return assessment;
};

// Calculate risk score based on checklist
const calculateRiskScore = (checklist) => {
  let score = 100;
  const penalties = {
    companyVerification: 25,
    addressVerification: 10,
    financialHealthCheck: 30,
    pastTrackRecord: 20,
    keyPersonnelCheck: 15,
    blacklistCheck: 50,
    industryClearance: 10,
  };

  for (const [key, value] of Object.entries(checklist)) {
    if (!value.verified) {
      score -= penalties[key] || 10;
    }
  }

  return Math.max(0, score);
};

// Categorize risk based on score
const categorizeRisk = (score) => {
  if (score >= 80) return 'LOW';
  if (score >= 50) return 'MEDIUM';
  return 'HIGH';
};

// Complete assessment
const completeAssessment = async (assessmentId, userId, decision, notes) => {
  const assessment = await SellerRiskAssessment.findById(assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  // Check all required items are verified for approval
  const requiredItems = ['companyVerification', 'financialHealthCheck', 'blacklistCheck'];
  const allRequired = requiredItems.every((item) => assessment.checklist[item]?.verified);

  if (decision === 'APPROVE') {
    if (!allRequired) {
      throw new Error('Cannot approve - required checklist items not verified');
    }

    // Auto-approve for LOW risk, require approval for MEDIUM/HIGH
    if (assessment.riskCategory === 'LOW') {
      assessment.status = 'APPROVED';
      assessment.recommendation = 'APPROVE';
      assessment.completedAt = new Date();

      // Update seller status
      await SubContractor.findByIdAndUpdate(assessment.seller, {
        status: 'RMT_APPROVED',
        $push: {
          statusHistory: {
            status: 'RMT_APPROVED',
            changedAt: new Date(),
            changedBy: userId,
            notes: `Risk score: ${assessment.riskScore}`,
          },
        },
      });
    } else {
      // Needs Ops Manager approval for MEDIUM/HIGH risk
      assessment.status = 'PENDING_APPROVAL';
      assessment.recommendation = 'APPROVE';

      const approvalRequest = new ApprovalRequest({
        requestType: assessment.riskCategory === 'HIGH' ? 'HIGH_RISK_CASE' : 'SELLER_RISK_REJECTION',
        title: `Risk Assessment Approval: ${assessment.riskCategory} Risk`,
        description: `Risk Score: ${assessment.riskScore}. ${notes || ''}`,
        entityType: 'risk_assessment',
        entityId: assessment._id,
        entityRef: 'SellerRiskAssessment',
        requestedBy: userId,
        priority: assessment.riskCategory === 'HIGH' ? 'HIGH' : 'MEDIUM',
      });
      await approvalRequest.save();
    }
  } else if (decision === 'REJECT') {
    // Rejection always needs Ops Manager approval
    assessment.status = 'PENDING_APPROVAL';
    assessment.recommendation = 'REJECT';

    const approvalRequest = new ApprovalRequest({
      requestType: 'SELLER_RISK_REJECTION',
      title: `Seller Rejection: Risk Assessment Failed`,
      description: notes || 'Seller failed risk assessment',
      entityType: 'risk_assessment',
      entityId: assessment._id,
      entityRef: 'SellerRiskAssessment',
      requestedBy: userId,
      priority: 'MEDIUM',
    });
    await approvalRequest.save();
  }

  assessment.notes = notes;
  await assessment.save();
  return assessment;
};

// Get pending assessments (RMT queue)
const getPendingAssessments = async () => {
  return await SellerRiskAssessment.find({ status: { $in: ['IN_PROGRESS', 'PENDING_APPROVAL'] } })
    .populate('seller', 'name companyName email')
    .populate('assessedBy', 'name')
    .sort({ createdAt: -1 });
};

// Get assessment by ID
const getAssessmentById = async (assessmentId) => {
  return await SellerRiskAssessment.findById(assessmentId)
    .populate('seller')
    .populate('assessedBy', 'name');
};

// Get assessment by seller
const getAssessmentBySeller = async (sellerId) => {
  return await SellerRiskAssessment.findOne({ seller: sellerId })
    .populate('assessedBy', 'name');
};

// Get assessment dashboard
const getRiskDashboard = async () => {
  const all = await SellerRiskAssessment.find({});
  
  return {
    total: all.length,
    inProgress: all.filter((a) => a.status === 'IN_PROGRESS').length,
    pendingApproval: all.filter((a) => a.status === 'PENDING_APPROVAL').length,
    approved: all.filter((a) => a.status === 'APPROVED').length,
    rejected: all.filter((a) => a.status === 'REJECTED').length,
    riskBreakdown: {
      low: all.filter((a) => a.riskCategory === 'LOW').length,
      medium: all.filter((a) => a.riskCategory === 'MEDIUM').length,
      high: all.filter((a) => a.riskCategory === 'HIGH').length,
    },
    avgRiskScore: all.length > 0 
      ? Math.round(all.reduce((sum, a) => sum + a.riskScore, 0) / all.length) 
      : 0,
  };
};

module.exports = {
  createRiskAssessment,
  updateChecklistItem,
  completeAssessment,
  getPendingAssessments,
  getAssessmentById,
  getAssessmentBySeller,
  getRiskDashboard,
};
