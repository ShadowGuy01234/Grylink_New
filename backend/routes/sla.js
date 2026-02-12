const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const slaService = require('../services/slaService');

// Create SLA for a case
router.post('/', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const sla = await slaService.createSla(req.body.caseId, req.body.entityType);
    res.status(201).json(sla);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get SLA dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const dashboard = await slaService.getSlaDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active SLAs
router.get('/active', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const slas = await slaService.getActiveSlas();
    res.json(slas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overdue SLAs
router.get('/overdue', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const slas = await slaService.getOverdueSlas();
    res.json(slas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check all milestones (cron job endpoint)
router.post('/check-milestones', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder', 'system'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const overdueList = await slaService.checkMilestones();
    res.json({ checked: true, overdue: overdueList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get SLA by case ID
router.get('/case/:caseId', auth, async (req, res) => {
  try {
    const sla = await slaService.getSlaByCase(req.params.caseId);
    if (!sla) {
      return res.status(404).json({ message: 'SLA not found for this case' });
    }
    res.json(sla);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a milestone
router.post('/:id/milestone/:milestone/complete', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const sla = await slaService.completeMilestone(
      req.params.id,
      req.params.milestone,
      req.user.id
    );
    res.json(sla);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send reminder
router.post('/:id/reminder', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const sla = await slaService.sendReminder(req.params.id, req.body.milestone, req.body.type);
    res.json(sla);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark entity as dormant
router.post('/dormant', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const result = await slaService.markDormant(req.body.entityType, req.body.entityId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
