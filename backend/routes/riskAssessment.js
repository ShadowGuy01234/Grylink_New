const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const riskAssessmentService = require('../services/riskAssessmentService');

// Create risk assessment for seller (RMT initiates)
router.post('/', auth, async (req, res) => {
  try {
    if (!['rmt', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const assessment = await riskAssessmentService.createRiskAssessment(
      req.body.sellerId,
      req.user.id
    );
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get risk dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!['rmt', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const dashboard = await riskAssessmentService.getRiskDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending assessments (RMT queue)
router.get('/pending', auth, async (req, res) => {
  try {
    if (!['rmt', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const assessments = await riskAssessmentService.getPendingAssessments();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assessment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await riskAssessmentService.getAssessmentById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assessment by seller ID
router.get('/seller/:sellerId', auth, async (req, res) => {
  try {
    const assessment = await riskAssessmentService.getAssessmentBySeller(req.params.sellerId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found for this seller' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update checklist item
router.put('/:id/checklist/:item', auth, async (req, res) => {
  try {
    if (!['rmt', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const assessment = await riskAssessmentService.updateChecklistItem(
      req.params.id,
      req.params.item,
      req.body,
      req.user.id
    );
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete assessment (approve/reject)
router.post('/:id/complete', auth, async (req, res) => {
  try {
    if (!['rmt', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const assessment = await riskAssessmentService.completeAssessment(
      req.params.id,
      req.user.id,
      req.body.decision,
      req.body.notes
    );
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
