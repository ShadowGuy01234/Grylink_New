const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const blacklistService = require('../services/blacklistService');

// Check if entity is blacklisted (used during onboarding)
router.post('/check', authenticate, async (req, res) => {
  try {
    const { pan, gstin, email } = req.body;
    const isBlacklisted = await blacklistService.checkBlacklist({ pan, gstin, email });
    res.json({ isBlacklisted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Report entity for blacklisting
router.post('/report', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await blacklistService.reportForBlacklist(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all blacklist entries
router.get('/', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entries = await blacklistService.getBlacklist(req.query);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending blacklist requests (Ops Manager)
router.get('/pending', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entries = await blacklistService.getPendingBlacklists();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve blacklist (Ops Manager)
router.post('/:id/approve', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await blacklistService.approveBlacklist(req.params.id, req.user.id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject blacklist request
router.post('/:id/reject', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await blacklistService.rejectBlacklistRequest(req.params.id, req.user.id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Revoke blacklist (Founders only)
router.post('/:id/revoke', authenticate, authorize('admin', 'founder'), async (req, res) => {
  try {
    const result = await blacklistService.revokeBlacklist(req.params.id, req.user.id, req.body.reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
