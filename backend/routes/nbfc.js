const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const nbfcService = require('../services/nbfcService');

// POST /api/nbfc - Create new NBFC (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const nbfc = await nbfcService.createNbfc(req.body);
    res.status(201).json(nbfc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/nbfc - Get all NBFCs
router.get('/', authenticate, authorize('admin', 'ops', 'rmt'), async (req, res) => {
  try {
    const nbfcs = await nbfcService.getNbfcs(req.query);
    res.json(nbfcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nbfc/dashboard - Get NBFC's own dashboard
router.get('/dashboard', authenticate, authorize('nbfc'), async (req, res) => {
  try {
    if (!req.user.nbfcId) {
      return res.status(400).json({ error: 'No NBFC linked to this account' });
    }
    const dashboard = await nbfcService.getNbfcDashboard(req.user.nbfcId);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nbfc/match/:caseId - Get matching NBFCs for a case (Tech Engine)
router.get(
  '/match/:caseId',
  authenticate,
  authorize('admin', 'ops', 'rmt'),
  async (req, res) => {
    try {
      const matches = await nbfcService.matchNbfcsForCase(req.params.caseId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/nbfc/share/:caseId - Share case with multiple NBFCs
router.post(
  '/share/:caseId',
  authenticate,
  authorize('admin', 'ops', 'rmt'),
  async (req, res) => {
    try {
      const { nbfcIds } = req.body;
      if (!nbfcIds || !Array.isArray(nbfcIds) || nbfcIds.length === 0) {
        return res.status(400).json({ error: 'nbfcIds array is required' });
      }

      const result = await nbfcService.shareCaseWithNbfcs(
        req.params.caseId,
        nbfcIds,
        req.user._id
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/nbfc/:id - Get NBFC by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const nbfc = await nbfcService.getNbfcById(req.params.id);
    res.json(nbfc);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// PUT /api/nbfc/:id - Update NBFC
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const nbfc = await nbfcService.updateNbfc(req.params.id, req.body, req.user._id);
    res.json(nbfc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/nbfc/:caseId/respond - NBFC responds to a case
router.post(
  '/:caseId/respond',
  authenticate,
  authorize('nbfc'),
  async (req, res) => {
    try {
      const { decision, interestRate, fundingDays, notes } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }

      const Case = require('../models/Case');
      const caseDoc = await Case.findById(req.params.caseId);
      if (!caseDoc) {
        return res.status(404).json({ error: 'Case not found' });
      }

      // Find this NBFC's sharing record
      const sharing = caseDoc.nbfcSharing?.find(
        (s) => s.nbfcId.toString() === req.user.nbfcId?.toString()
      );
      if (!sharing) {
        return res.status(403).json({ error: 'Case not shared with your NBFC' });
      }

      sharing.status = decision === 'approve' ? 'APPROVED' : 'REJECTED';
      sharing.respondedAt = new Date();
      sharing.interestRate = interestRate;
      sharing.fundingDays = fundingDays;
      sharing.notes = notes;

      await caseDoc.save();

      // Update NBFC metrics
      await nbfcService.updateNbfcMetrics(req.user.nbfcId, {
        approved: decision === 'approve',
        processingDays: Math.ceil(
          (new Date() - sharing.sharedAt) / (1000 * 60 * 60 * 24)
        ),
      });

      res.json({ message: 'Response recorded', case: caseDoc });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
