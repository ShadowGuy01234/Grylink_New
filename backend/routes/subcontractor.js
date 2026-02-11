const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadBills } = require('../middleware/upload');
const subContractorService = require('../services/subContractorService');

// PUT /api/subcontractor/profile - Complete profile (Step 10)
router.put('/profile', authenticate, authorize('subcontractor'), async (req, res) => {
  try {
    const result = await subContractorService.completeProfile(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/subcontractor/bills - Upload bills (Step 11)
router.post(
  '/bills',
  authenticate,
  authorize('subcontractor'),
  uploadBills.array('bills', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one bill file is required' });
      }

      const bills = await subContractorService.uploadBill(req.user._id, req.files, req.body);
      res.status(201).json(bills);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/subcontractor/cwc - Submit CWC RF (Step 13)
router.post('/cwc', authenticate, authorize('subcontractor'), async (req, res) => {
  try {
    const cwcRf = await subContractorService.submitCwcRf(req.user._id, req.body);
    res.status(201).json(cwcRf);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/subcontractor/bids/:id/respond - Respond to bid (Step 18)
router.post('/bids/:id/respond', authenticate, authorize('subcontractor'), async (req, res) => {
  try {
    const { decision, counterOffer } = req.body;
    if (!decision || !['accept', 'reject', 'negotiate'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be accept, reject, or negotiate' });
    }

    const result = await subContractorService.respondToBid(
      req.user._id,
      req.params.id,
      decision,
      counterOffer
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/subcontractor/dashboard - Get dashboard data
router.get('/dashboard', authenticate, authorize('subcontractor'), async (req, res) => {
  try {
    const data = await subContractorService.getDashboard(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
