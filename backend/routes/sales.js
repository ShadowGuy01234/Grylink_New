const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const salesService = require('../services/salesService');

// ─── COMPANY LEADS ────────────────────────────────────────────────────────────

// POST /api/sales/leads - Create a new company lead (Step 3)
router.post('/leads', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await salesService.createCompanyLead(req.body, req.user._id);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/sales/leads - Get all leads (with search + filter)
router.get('/leads', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const { search, status } = req.query;
    const leads = await salesService.getLeads(req.user._id, req.user.role, { search, status });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales/leads/:id - Get single company detail
router.get('/leads/:id', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const company = await salesService.getCompanyDetail(req.params.id, req.user._id, req.user.role);
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/sales/leads/:id/subcontractors - Get SCs linked to a company
router.get('/leads/:id/subcontractors', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const scs = await salesService.getSubContractorsForCompany(req.params.id);
    res.json(scs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sales/leads/:id/notes - Add internal note to company
router.post('/leads/:id/notes', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ error: 'Note text is required' });
    const company = await salesService.addCompanyNote(req.params.id, req.user._id, note);
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/sales/leads/:id/resend-link - Resend GryLink for a company
router.post('/leads/:id/resend-link', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await salesService.resendCompanyGryLink(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── SUB-CONTRACTORS ─────────────────────────────────────────────────────────

// GET /api/sales/subcontractors - Get all SC leads (with search + filter)
router.get('/subcontractors', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const { search, status, kycStatus } = req.query;
    const leads = await salesService.getSubContractorLeads(req.user._id, req.user.role, { search, status, kycStatus });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales/subcontractors/:id - Get single SC detail
router.get('/subcontractors/:id', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const sc = await salesService.getSubContractorDetail(req.params.id);
    res.json(sc);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// PATCH /api/sales/subcontractors/:id/contacted - Mark sub-contractor as contacted
router.patch('/subcontractors/:id/contacted', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await salesService.markSubContractorContacted(req.params.id, req.user._id, req.body.notes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/sales/subcontractors/:id/contact-log - Add contact log entry
router.post('/subcontractors/:id/contact-log', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const { method, outcome, notes } = req.body;
    if (!method) return res.status(400).json({ error: 'Contact method is required' });
    const sc = await salesService.addContactLog(req.params.id, req.user._id, { method, outcome, notes });
    res.json(sc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── GRYLINKS ────────────────────────────────────────────────────────────────

// GET /api/sales/grylinks - Get all GryLinks for the sales agent
router.get('/grylinks', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const { status, linkType } = req.query;
    const links = await salesService.getGryLinks(req.user._id, req.user.role, { status, linkType });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sales/grylinks/:id/resend - Resend a GryLink
router.post('/grylinks/:id/resend', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await salesService.resendGryLink(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

// GET /api/sales/dashboard - Get rich dashboard stats + funnel + activity
router.get('/dashboard', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const stats = await salesService.getDashboardStats(req.user._id, req.user.role);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
