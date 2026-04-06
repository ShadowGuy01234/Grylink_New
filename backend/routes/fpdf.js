const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const fpdfService = require('../services/fpdfService');

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

router.get('/dashboard', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const stats = await fpdfService.getDashboardStats(req.user._id, req.user.role);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// POST /api/fpdf - Create new FPDF entry
router.post('/', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await fpdfService.createEntry(req.body, req.user._id);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/fpdf - Get all entries (filtered)
router.get('/', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const { pipeline, status, classification, search } = req.query;
    const entries = await fpdfService.getEntries(req.user._id, req.user.role, { pipeline, status, classification, search });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fpdf/:id - Get single entry
router.get('/:id', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await fpdfService.getEntryById(req.params.id);
    res.json(entry);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// PUT /api/fpdf/:id - Update entry
router.put('/:id', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await fpdfService.updateEntry(req.params.id, req.body, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── SUBMISSION & CONVERSION ─────────────────────────────────────────────────

// POST /api/fpdf/:id/submit - Submit entry for scoring
router.post('/:id/submit', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await fpdfService.submitEntry(req.params.id, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/fpdf/:id/convert - Convert to NBFC record
router.post('/:id/convert', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await fpdfService.convertToNbfc(req.params.id, req.user._id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
