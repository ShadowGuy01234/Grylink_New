const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const agentService = require('../services/agentService');

// Create agent
router.post('/', auth, async (req, res) => {
  try {
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const agent = await agentService.createAgent(req.body, req.user.id);
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get agent dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const dashboard = await agentService.getAgentDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all agents
router.get('/', auth, async (req, res) => {
  try {
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const agents = await agentService.getAgents(req.query);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get agent by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register EPC introduction
router.post('/:id/introduce-epc', auth, async (req, res) => {
  try {
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const agent = await agentService.registerEpcIntroduction(req.params.id, req.body.epcId);
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process commission (called after first CWC)
router.post('/process-commission/:transactionId', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const result = await agentService.processCommission(req.params.transactionId);
    res.json(result || { message: 'No commission applicable' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark commission as paid
router.post('/:id/commission/:index/pay', auth, async (req, res) => {
  try {
    if (!['ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const agent = await agentService.markCommissionPaid(
      req.params.id,
      parseInt(req.params.index),
      req.body.paymentReference
    );
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Report misconduct
router.post('/:id/misconduct', auth, async (req, res) => {
  try {
    if (!['sales', 'ops', 'admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const result = await agentService.reportMisconduct(req.params.id, req.body, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Handle misconduct decision (Founders only)
router.post('/:id/misconduct/:index/decision', auth, async (req, res) => {
  try {
    if (!['admin', 'founder'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Founders can decide on misconduct' });
    }
    const agent = await agentService.handleMisconductDecision(
      req.params.id,
      parseInt(req.params.index),
      req.body.decision,
      req.user.id
    );
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
