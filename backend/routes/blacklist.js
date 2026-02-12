const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const blacklistService = require('../services/blacklistService');

// Check if entity is blacklisted (used during onboarding)
router.post('/check', auth, async (req, res) => {
  try {
    const { pan, gstin, email } = req.body;
    const isBlacklisted = await blacklistService.checkBlacklist({ pan, gstin, email });
    res.json({ isBlacklisted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Report entity for blacklisting
router.post('/report', auth, async (req, res) => {
  try {
    // Only Sales, Ops can report
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to report blacklisting' });
    }
    const result = await blacklistService.reportForBlacklist(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all blacklist entries
router.get('/', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const entries = await blacklistService.getBlacklist(req.query);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending blacklist requests (Ops Manager)
router.get('/pending', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const entries = await blacklistService.getPendingBlacklists();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve blacklist (Ops Manager)
router.post('/:id/approve', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to approve blacklisting' });
    }
    const result = await blacklistService.approveBlacklist(req.params.id, req.user.id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject blacklist request
router.post('/:id/reject', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to reject blacklisting' });
    }
    const result = await blacklistService.rejectBlacklistRequest(req.params.id, req.user.id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Revoke blacklist (Founders only)
router.post('/:id/revoke', auth, async (req, res) => {
  try {
    if (!['admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Founders can revoke blacklisting' });
    }
    const result = await blacklistService.revokeBlacklist(req.params.id, req.user.id, req.body.reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
