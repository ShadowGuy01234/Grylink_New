const ApprovalRequest = require('../models/ApprovalRequest');
const User = require('../models/User');
const SubContractor = require('../models/SubContractor');

// Create approval request
const createApprovalRequest = async (data, requestedBy) => {
  const { requestType, title, description, entityType, entityId, entityRef, data: requestData, priority } = data;

  // Determine approval chain based on request type
  let approvalChain = [];
  let targetLevel = 1;

  switch (requestType) {
    case 'SELLER_RISK_REJECTION':
      // RMT rejects seller - needs Ops Manager approval
      approvalChain = [{ level: 1, role: 'ops', approverName: 'Ops Manager' }];
      break;
    case 'HIGH_RISK_CASE':
      // High risk needs Ops Manager then Founder
      approvalChain = [
        { level: 1, role: 'ops', approverName: 'Ops Manager' },
        { level: 2, role: 'founder', approverName: 'Founder' },
      ];
      break;
    case 'DEAL_ABOVE_1CR':
      // Deals > 1 Cr need Founder approval
      approvalChain = [{ level: 1, role: 'founder', approverName: 'Founder' }];
      break;
    case 'EPC_DELAY_ESCALATION':
      // EPC delays need Ops then Founder
      approvalChain = [
        { level: 1, role: 'ops', approverName: 'Ops Manager' },
        { level: 2, role: 'founder', approverName: 'Founder' },
      ];
      break;
    case 'BLACKLIST_APPROVAL':
      approvalChain = [{ level: 1, role: 'ops', approverName: 'Ops Manager' }];
      break;
    case 'NEW_NBFC_ONBOARDING':
      approvalChain = [{ level: 1, role: 'founder', approverName: 'Founder' }];
      break;
    case 'DORMANT_ESCALATION':
      approvalChain = [{ level: 1, role: 'ops', approverName: 'Ops Manager' }];
      break;
    default:
      approvalChain = [{ level: 1, role: 'ops', approverName: 'Ops Manager' }];
  }

  const request = new ApprovalRequest({
    requestType,
    title,
    description,
    entityType,
    entityId,
    entityRef,
    data: requestData,
    requestedBy,
    priority: priority || 'MEDIUM',
    approvalChain,
    currentLevel: 1,
    status: 'PENDING',
  });
  await request.save();

  return request;
};

// Process approval (approve/reject at current level)
const processApproval = async (requestId, userId, action, comments) => {
  const request = await ApprovalRequest.findById(requestId);
  if (!request) throw new Error('Approval request not found');
  if (request.status !== 'PENDING') throw new Error('Request is not pending');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Check if user can approve at current level
  const currentChain = request.approvalChain.find((c) => c.level === request.currentLevel);
  if (!currentChain) throw new Error('Invalid approval chain');

  if (currentChain.role !== user.role && user.role !== 'admin' && user.role !== 'founder') {
    throw new Error(`Only ${currentChain.role} can approve at this level`);
  }

  // Record approval
  currentChain.approvedBy = userId;
  currentChain.approvedAt = new Date();
  currentChain.comments = comments;
  currentChain.status = action === 'approve' ? 'APPROVED' : 'REJECTED';

  if (action === 'reject') {
    request.status = 'REJECTED';
    request.rejectedBy = userId;
    request.rejectedAt = new Date();
    request.rejectionReason = comments;
  } else if (action === 'approve') {
    // Check if there's a next level
    const nextLevel = request.approvalChain.find((c) => c.level === request.currentLevel + 1);
    if (nextLevel) {
      request.currentLevel = nextLevel.level;
    } else {
      // All levels approved
      request.status = 'APPROVED';
      request.resolvedAt = new Date();

      // Handle post-approval actions based on type
      await handlePostApproval(request);
    }
  }

  await request.save();
  return request;
};

// Handle actions after full approval
const handlePostApproval = async (request) => {
  switch (request.requestType) {
    case 'SELLER_RISK_REJECTION':
      // Mark seller as rejected
      await SubContractor.findByIdAndUpdate(request.entityId, {
        status: 'RMT_REJECTED',
        $push: {
          statusHistory: {
            status: 'RMT_REJECTED',
            changedAt: new Date(),
            notes: 'Risk assessment rejected after approval',
          },
        },
      });
      break;
    // Add more post-approval handlers as needed
  }
};

// Get pending approvals for a user
const getMyPendingApprovals = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Find requests where user's role matches current level
  return await ApprovalRequest.find({
    status: 'PENDING',
    'approvalChain.level': { $exists: true },
  })
    .then((requests) =>
      requests.filter((r) => {
        const currentChain = r.approvalChain.find((c) => c.level === r.currentLevel);
        return (
          currentChain &&
          (currentChain.role === user.role || user.role === 'admin' || user.role === 'founder')
        );
      })
    )
    .then((filtered) =>
      ApprovalRequest.populate(filtered, { path: 'requestedBy', select: 'name email' })
    );
};

// Get all approval requests (with filters)
const getApprovalRequests = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.requestType) query.requestType = filters.requestType;
  if (filters.priority) query.priority = filters.priority;

  return await ApprovalRequest.find(query)
    .populate('requestedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Get approval request by ID
const getApprovalRequestById = async (requestId) => {
  return await ApprovalRequest.findById(requestId)
    .populate('requestedBy', 'name email')
    .populate('approvalChain.approvedBy', 'name');
};

// Escalate request to next level
const escalateRequest = async (requestId, escalatedBy, reason) => {
  const request = await ApprovalRequest.findById(requestId);
  if (!request) throw new Error('Approval request not found');

  const nextLevel = request.approvalChain.find((c) => c.level === request.currentLevel + 1);
  if (!nextLevel) throw new Error('Cannot escalate - already at highest level');

  request.currentLevel = nextLevel.level;
  request.escalatedBy = escalatedBy;
  request.escalatedAt = new Date();
  request.escalationReason = reason;
  await request.save();

  return request;
};

// Get pending count by role
const getPendingCountByRole = async (role) => {
  const all = await ApprovalRequest.find({ status: 'PENDING' });
  return all.filter((r) => {
    const currentChain = r.approvalChain.find((c) => c.level === r.currentLevel);
    return currentChain && (currentChain.role === role || role === 'admin' || role === 'founder');
  }).length;
};

module.exports = {
  createApprovalRequest,
  processApproval,
  getMyPendingApprovals,
  getApprovalRequests,
  getApprovalRequestById,
  escalateRequest,
  getPendingCountByRole,
};
