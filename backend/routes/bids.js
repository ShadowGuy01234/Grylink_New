const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const bidService = require('../services/bidService');

// POST /api/bids - Place a bid (Step 17)
router.post('/', authenticate, authorize('epc'), async (req, res) => {
  try {
    const { caseId, bidAmount, fundingDurationDays } = req.body;
    if (!caseId || !bidAmount || !fundingDurationDays) {
      return res.status(400).json({ error: 'caseId, bidAmount, and fundingDurationDays are required' });
    }

    const result = await bidService.placeBid(
      caseId,
      req.user.companyId,
      req.user._id,
      bidAmount,
      fundingDurationDays
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/bids/:id/negotiate - Negotiate a bid (Step 19)
router.post('/:id/negotiate', authenticate, authorize('epc', 'subcontractor'), async (req, res) => {
  try {
    const { counterOffer } = req.body;
    if (!counterOffer || !counterOffer.amount) {
      return res.status(400).json({ error: 'counterOffer with amount is required' });
    }

    const bid = await bidService.negotiate(req.params.id, req.user._id, counterOffer);
    res.json(bid);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/bids/:id/lock - Lock commercial agreement (Step 19)
router.post('/:id/lock', authenticate, authorize('epc', 'subcontractor'), async (req, res) => {
  try {
    const result = await bidService.lockCommercial(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/bids/case/:caseId - Get bids for a case
router.get('/case/:caseId', authenticate, async (req, res) => {
  try {
    const bids = await bidService.getBidsForCase(req.params.caseId);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
