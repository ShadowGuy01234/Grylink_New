const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const caseService = require('../services/caseService');

// GET /api/cases - Get all cases with optional filters
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    // Scope cases based on role
    if (req.user.role === 'epc') {
      filters.epcId = req.user.companyId;
    }

    const cases = await caseService.getCases(filters);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cases/:id - Get single case
router.get('/:id', authenticate, async (req, res) => {
  try {
    const caseDoc = await caseService.getCaseById(req.params.id);
    res.json(caseDoc);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/cases/:id/review - EPC reviews a case (Step 16)
router.post('/:id/review', authenticate, authorize('epc'), async (req, res) => {
  try {
    const { decision, notes } = req.body;
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approve or reject' });
    }

    const caseDoc = await caseService.epcReviewCase(
      req.params.id,
      decision,
      notes,
      req.user._id
    );
    res.json(caseDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
