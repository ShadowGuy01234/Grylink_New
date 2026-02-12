const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const approvalService = require('../services/approvalService');

// Create approval request
router.post('/', authenticate, async (req, res) => {
  try {
    const request = await approvalService.createApprovalRequest(req.body, req.user.id);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my pending approvals
router.get('/my-pending', authenticate, async (req, res) => {
  try {
    const requests = await approvalService.getMyPendingApprovals(req.user.id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending count for current user's role
router.get('/pending-count', authenticate, async (req, res) => {
  try {
    const count = await approvalService.getPendingCountByRole(req.user.role);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all approval requests (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const requests = await approvalService.getApprovalRequests(req.query);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get approval request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await approvalService.getApprovalRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve request
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    const request = await approvalService.processApproval(
      req.params.id,
      req.user.id,
      'approve',
      req.body.comments
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject request
router.post('/:id/reject', authenticate, async (req, res) => {
  try {
    const request = await approvalService.processApproval(
      req.params.id,
      req.user.id,
      'reject',
      req.body.comments
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Escalate request
router.post('/:id/escalate', authenticate, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to escalate' });
    }
    const request = await approvalService.escalateRequest(
      req.params.id,
      req.user.id,
      req.body.reason
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
