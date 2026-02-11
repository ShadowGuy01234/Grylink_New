const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const salesService = require('../services/salesService');

// POST /api/sales/leads - Create a new company lead (Step 3)
router.post('/leads', authenticate, authorize('sales', 'admin'), async (req, res) => {
  try {
    const result = await salesService.createCompanyLead(req.body, req.user._id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/sales/leads - Get all leads for the current sales agent
router.get('/leads', authenticate, authorize('sales', 'admin'), async (req, res) => {
  try {
    const leads = await salesService.getLeads(req.user._id);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales/subcontractors - Get sub-contractor leads
router.get('/subcontractors', authenticate, authorize('sales', 'admin'), async (req, res) => {
  try {
    const leads = await salesService.getSubContractorLeads(req.user._id);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/sales/subcontractors/:id/contacted - Mark sub-contractor as contacted
router.patch('/subcontractors/:id/contacted', authenticate, authorize('sales', 'admin'), async (req, res) => {
  try {
    const result = await salesService.markSubContractorContacted(req.params.id, req.user._id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/sales/dashboard - Get dashboard stats
router.get('/dashboard', authenticate, authorize('sales', 'admin'), async (req, res) => {
  try {
    const stats = await salesService.getDashboardStats(req.user._id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
