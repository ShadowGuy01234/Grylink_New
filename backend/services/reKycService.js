/**
 * Re-KYC Service
 * Handles re-KYC triggers per SOP Section 8
 * Triggers: Bank change, Board change, Rating downgrade, NBFC request
 */
const Company = require('../models/Company');
const SubContractor = require('../models/SubContractor');
const ApprovalRequest = require('../models/ApprovalRequest');
const emailService = require('./emailService');

// Re-KYC trigger reasons
const RE_KYC_TRIGGERS = {
  BANK_CHANGE: 'Bank account or details changed',
  BOARD_CHANGE: 'Change in board composition or key management',
  RATING_DOWNGRADE: 'Credit rating downgrade detected',
  NBFC_REQUEST: 'NBFC requested re-verification',
  ANNUAL_RENEWAL: 'Annual KYC validity renewal',
  COMPLIANCE_FLAG: 'Compliance flag raised',
  MANUAL_TRIGGER: 'Manual re-KYC initiated',
};

/**
 * Trigger re-KYC for a company (EPC)
 */
const triggerCompanyReKyc = async (companyId, trigger, initiatedBy, details = {}) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error('Company not found');

  // Create re-KYC record
  const reKycEntry = {
    triggeredAt: new Date(),
    reason: RE_KYC_TRIGGERS[trigger] || trigger,
    trigger,
    initiatedBy,
    details,
    status: 'PENDING',
  };

  // Initialize reKycHistory if needed
  if (!company.reKycHistory) {
    company.reKycHistory = [];
  }
  company.reKycHistory.push(reKycEntry);

  // Update KYC validity status
  company.kycVerification = company.kycVerification || {};
  company.kycVerification.status = 'PENDING_RE_KYC';
  company.kycVerification.lastTriggeredAt = new Date();

  // Invalidate current KYC
  company.kycVerification.isValid = false;

  await company.save();

  // Create approval request for critical triggers
  if (['BANK_CHANGE', 'BOARD_CHANGE', 'RATING_DOWNGRADE'].includes(trigger)) {
    await ApprovalRequest.create({
      type: 'EPC_RE_KYC',
      entityType: 'COMPANY',
      entityId: companyId,
      priority: trigger === 'RATING_DOWNGRADE' ? 'HIGH' : 'MEDIUM',
      requestedBy: initiatedBy,
      reason: RE_KYC_TRIGGERS[trigger],
      documentReferences: details.documents || [],
      approvalChain: ['ops'],
    });
  }

  // Notify concerned parties
  try {
    await emailService.sendReKycNotification(company, trigger, details);
  } catch (err) {
    console.error('Failed to send re-KYC notification:', err);
  }

  return {
    success: true,
    message: 'Re-KYC triggered successfully',
    trigger,
    status: 'PENDING',
  };
};

/**
 * Trigger re-KYC for a subcontractor
 */
const triggerSubContractorReKyc = async (subContractorId, trigger, initiatedBy, details = {}) => {
  const sc = await SubContractor.findById(subContractorId);
  if (!sc) throw new Error('SubContractor not found');

  const reKycEntry = {
    triggeredAt: new Date(),
    reason: RE_KYC_TRIGGERS[trigger] || trigger,
    trigger,
    initiatedBy,
    details,
    status: 'PENDING',
  };

  if (!sc.reKycHistory) {
    sc.reKycHistory = [];
  }
  sc.reKycHistory.push(reKycEntry);

  // Update verification status
  sc.verificationStatus = 'PENDING_RE_KYC';

  await sc.save();

  return {
    success: true,
    message: 'Re-KYC triggered for SubContractor',
    trigger,
    status: 'PENDING',
  };
};

/**
 * Detect bank change and trigger re-KYC automatically
 */
const detectBankChange = async (entityType, entityId, oldBankDetails, newBankDetails) => {
  // Check if bank details actually changed
  const hasChanged = 
    oldBankDetails.accountNumber !== newBankDetails.accountNumber ||
    oldBankDetails.ifscCode !== newBankDetails.ifscCode ||
    oldBankDetails.bankName !== newBankDetails.bankName;

  if (!hasChanged) return { triggered: false };

  const details = {
    previousBank: oldBankDetails.bankName,
    newBank: newBankDetails.bankName,
    previousAccount: oldBankDetails.accountNumber ? '****' + oldBankDetails.accountNumber.slice(-4) : null,
    newAccount: newBankDetails.accountNumber ? '****' + newBankDetails.accountNumber.slice(-4) : null,
  };

  if (entityType === 'COMPANY') {
    return await triggerCompanyReKyc(entityId, 'BANK_CHANGE', null, details);
  } else if (entityType === 'SUBCONTRACTOR') {
    return await triggerSubContractorReKyc(entityId, 'BANK_CHANGE', null, details);
  }

  return { triggered: false };
};

/**
 * Handle NBFC re-KYC request
 */
const handleNbfcReKycRequest = async (entityType, entityId, nbfcId, reason, requestedBy) => {
  const details = {
    nbfcId,
    nbfcReason: reason,
    requestedAt: new Date(),
  };

  if (entityType === 'COMPANY') {
    return await triggerCompanyReKyc(entityId, 'NBFC_REQUEST', requestedBy, details);
  } else if (entityType === 'SUBCONTRACTOR') {
    return await triggerSubContractorReKyc(entityId, 'NBFC_REQUEST', requestedBy, details);
  }

  throw new Error('Invalid entity type');
};

/**
 * Complete re-KYC process
 */
const completeReKyc = async (entityType, entityId, completedBy, documents = []) => {
  let entity;

  if (entityType === 'COMPANY') {
    entity = await Company.findById(entityId);
    if (!entity) throw new Error('Company not found');

    // Update KYC verification
    entity.kycVerification = entity.kycVerification || {};
    entity.kycVerification.status = 'VERIFIED';
    entity.kycVerification.isValid = true;
    entity.kycVerification.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    entity.kycVerification.lastVerifiedAt = new Date();
    entity.kycVerification.verifiedBy = completedBy;

    // Update latest re-KYC entry
    if (entity.reKycHistory && entity.reKycHistory.length > 0) {
      const latestEntry = entity.reKycHistory[entity.reKycHistory.length - 1];
      latestEntry.status = 'COMPLETED';
      latestEntry.completedAt = new Date();
      latestEntry.completedBy = completedBy;
      latestEntry.documents = documents;
    }
  } else if (entityType === 'SUBCONTRACTOR') {
    entity = await SubContractor.findById(entityId);
    if (!entity) throw new Error('SubContractor not found');

    entity.verificationStatus = 'VERIFIED';

    if (entity.reKycHistory && entity.reKycHistory.length > 0) {
      const latestEntry = entity.reKycHistory[entity.reKycHistory.length - 1];
      latestEntry.status = 'COMPLETED';
      latestEntry.completedAt = new Date();
      latestEntry.completedBy = completedBy;
    }
  }

  await entity.save();

  return {
    success: true,
    message: 'Re-KYC completed successfully',
    entityType,
    entityId,
  };
};

/**
 * Get pending re-KYC requests
 */
const getPendingReKyc = async (entityType = null) => {
  const results = [];

  if (!entityType || entityType === 'COMPANY') {
    const companies = await Company.find({
      'kycVerification.status': 'PENDING_RE_KYC',
    }).select('companyName cin kycVerification reKycHistory');
    
    results.push(...companies.map(c => ({
      entityType: 'COMPANY',
      entityId: c._id,
      name: c.companyName,
      cin: c.cin,
      latestTrigger: c.reKycHistory?.[c.reKycHistory.length - 1],
    })));
  }

  if (!entityType || entityType === 'SUBCONTRACTOR') {
    const subContractors = await SubContractor.find({
      verificationStatus: 'PENDING_RE_KYC',
    }).select('name pan verificationStatus reKycHistory');
    
    results.push(...subContractors.map(sc => ({
      entityType: 'SUBCONTRACTOR',
      entityId: sc._id,
      name: sc.name,
      pan: sc.pan,
      latestTrigger: sc.reKycHistory?.[sc.reKycHistory.length - 1],
    })));
  }

  return results;
};

/**
 * Check for expiring KYC (for cron job)
 */
const checkExpiringKyc = async (daysThreshold = 30) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysThreshold);

  const expiring = await Company.find({
    'kycVerification.validUntil': { $lte: expiryDate },
    'kycVerification.status': { $ne: 'PENDING_RE_KYC' },
  }).select('companyName kycVerification');

  return expiring;
};

module.exports = {
  RE_KYC_TRIGGERS,
  triggerCompanyReKyc,
  triggerSubContractorReKyc,
  detectBankChange,
  handleNbfcReKycRequest,
  completeReKyc,
  getPendingReKyc,
  checkExpiringKyc,
};
