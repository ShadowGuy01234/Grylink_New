const Blacklist = require('../models/Blacklist');
const SubContractor = require('../models/SubContractor');
const Company = require('../models/Company');
const ApprovalRequest = require('../models/ApprovalRequest');

// Check if entity is blacklisted (used during onboarding)
const checkBlacklist = async ({ pan, gstin, email }) => {
  return await Blacklist.isBlacklisted({ pan, gstin, email });
};

// Report entity for blacklisting (requires Ops approval)
const reportForBlacklist = async (data, reportedBy) => {
  const { entityType, entityId, reason, reasonDetails, pan, gstin, email, companyName, ownerName } = data;

  // Check if already blacklisted
  const existing = await Blacklist.findOne({
    $or: [
      { pan: pan?.toUpperCase(), status: { $ne: 'REVOKED' } },
      { gstin: gstin?.toUpperCase(), status: { $ne: 'REVOKED' } },
    ],
  });
  if (existing) {
    throw new Error('Entity is already blacklisted or pending blacklist');
  }

  // Create blacklist entry
  const blacklist = new Blacklist({
    pan: pan?.toUpperCase(),
    gstin: gstin?.toUpperCase(),
    email: email?.toLowerCase(),
    companyName,
    ownerName,
    entityType,
    entityId,
    entityRef: entityType === 'company' ? 'Company' : 'SubContractor',
    reason,
    reasonDetails,
    reportedBy,
    status: 'PENDING_APPROVAL',
  });
  await blacklist.save();

  // Create approval request for Ops Manager
  const approvalRequest = new ApprovalRequest({
    requestType: 'BLACKLIST_APPROVAL',
    title: `Blacklist Request: ${companyName || 'Unknown'}`,
    description: `Reason: ${reason}. ${reasonDetails || ''}`,
    entityType: 'blacklist',
    entityId: blacklist._id,
    entityRef: 'Blacklist',
    requestedBy: reportedBy,
    priority: reason === 'FRAUD' ? 'HIGH' : 'MEDIUM',
  });
  await approvalRequest.save();

  blacklist.approvalRequestId = approvalRequest._id;
  await blacklist.save();

  return { blacklist, approvalRequest };
};

// Approve blacklist (Ops Manager)
const approveBlacklist = async (blacklistId, userId, notes) => {
  const blacklist = await Blacklist.findById(blacklistId);
  if (!blacklist) throw new Error('Blacklist entry not found');
  if (blacklist.status !== 'PENDING_APPROVAL') {
    throw new Error('Blacklist is not pending approval');
  }

  blacklist.status = 'ACTIVE';
  blacklist.approvedBy = userId;
  blacklist.approvedAt = new Date();
  await blacklist.save();

  // Mark the original entity as blacklisted
  if (blacklist.entityType === 'subcontractor' && blacklist.entityId) {
    await SubContractor.findByIdAndUpdate(blacklist.entityId, {
      status: 'BLACKLISTED',
      $push: {
        statusHistory: {
          status: 'BLACKLISTED',
          changedAt: new Date(),
          changedBy: userId,
          notes: `Blacklisted: ${blacklist.reason}`,
        },
      },
    });
  } else if (blacklist.entityType === 'company' && blacklist.entityId) {
    await Company.findByIdAndUpdate(blacklist.entityId, {
      status: 'BLACKLISTED',
      $push: {
        statusHistory: {
          status: 'BLACKLISTED',
          changedAt: new Date(),
          changedBy: userId,
          notes: `Blacklisted: ${blacklist.reason}`,
        },
      },
    });
  }

  return blacklist;
};

// Reject blacklist request
const rejectBlacklistRequest = async (blacklistId, userId, notes) => {
  const blacklist = await Blacklist.findById(blacklistId);
  if (!blacklist) throw new Error('Blacklist entry not found');

  blacklist.status = 'REVOKED';
  blacklist.revocationReason = notes || 'Request rejected';
  blacklist.revokedBy = userId;
  blacklist.revokedAt = new Date();
  await blacklist.save();

  return blacklist;
};

// Revoke blacklist (rare - Founders only)
const revokeBlacklist = async (blacklistId, userId, reason) => {
  const blacklist = await Blacklist.findById(blacklistId);
  if (!blacklist) throw new Error('Blacklist entry not found');
  if (blacklist.status !== 'ACTIVE') {
    throw new Error('Only active blacklists can be revoked');
  }

  blacklist.status = 'REVOKED';
  blacklist.revocationReason = reason;
  blacklist.revokedBy = userId;
  blacklist.revokedAt = new Date();
  await blacklist.save();

  return blacklist;
};

// Get all blacklist entries
const getBlacklist = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.reason) query.reason = filters.reason;

  return await Blacklist.find(query)
    .populate('reportedBy', 'name')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });
};

// Get pending blacklist requests
const getPendingBlacklists = async () => {
  return await Blacklist.find({ status: 'PENDING_APPROVAL' })
    .populate('reportedBy', 'name')
    .sort({ createdAt: -1 });
};

module.exports = {
  checkBlacklist,
  reportForBlacklist,
  approveBlacklist,
  rejectBlacklistRequest,
  revokeBlacklist,
  getBlacklist,
  getPendingBlacklists,
};
