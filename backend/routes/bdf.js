const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const bdfService = require('../services/bdfService');

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

router.get('/dashboard', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const stats = await bdfService.getDashboardStats(req.user._id, req.user.role);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// POST /api/bdf - Create new BDF entry
router.post('/', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.createEntry(req.body, req.user._id);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/bdf - Get all entries (filtered)
router.get('/', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const { pipeline, status, classification, search } = req.query;
    const entries = await bdfService.getEntries(req.user._id, req.user.role, { pipeline, status, classification, search });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bdf/:id - Get single entry
router.get('/:id', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.getEntryById(req.params.id);
    res.json(entry);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// PUT /api/bdf/:id - Update entry
router.put('/:id', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.updateEntry(req.params.id, req.body, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── GROUND INTELLIGENCE ─────────────────────────────────────────────────────

// POST /api/bdf/:id/ground-intelligence - Add conversation
router.post('/:id/ground-intelligence', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.addGroundIntelligence(req.params.id, req.body, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/bdf/:id/ground-intelligence/:convoId - Remove conversation
router.delete('/:id/ground-intelligence/:convoId', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.removeGroundIntelligence(req.params.id, req.params.convoId, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── SUBMISSION & CONVERSION ─────────────────────────────────────────────────

// POST /api/bdf/:id/submit - Submit entry for scoring
router.post('/:id/submit', authenticate, authorize('sales', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const entry = await bdfService.submitEntry(req.params.id, req.user._id);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/bdf/:id/convert - Convert to Company lead
router.post('/:id/convert', authenticate, authorize('sales', 'admin', 'founder'), async (req, res) => {
  try {
    const result = await bdfService.convertToLead(req.params.id, req.user._id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
