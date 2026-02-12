/**
 * Re-KYC Routes
 * Handles re-KYC trigger and completion per SOP Section 8
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reKycService = require('../services/reKycService');

/**
 * GET /api/rekyc/pending
 * Get all pending re-KYC requests
 */
router.get('/pending', auth(['ops', 'rmt', 'admin', 'founder']), async (req, res) => {
  try {
    const { entityType } = req.query;
    const pending = await reKycService.getPendingReKyc(entityType);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Get pending re-KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rekyc/expiring
 * Get KYC expiring within threshold
 */
router.get('/expiring', auth(['ops', 'rmt', 'admin', 'founder']), async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 30;
    const expiring = await reKycService.checkExpiringKyc(daysThreshold);
    res.json({ success: true, data: expiring });
  } catch (error) {
    console.error('Get expiring KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rekyc/trigger/company/:id
 * Trigger re-KYC for a company
 */
router.post('/trigger/company/:id', auth(['ops', 'rmt', 'nbfc', 'admin', 'founder']), async (req, res) => {
  try {
    const { trigger, details } = req.body;
    
    if (!trigger) {
      return res.status(400).json({ error: 'Trigger reason is required' });
    }

    const result = await reKycService.triggerCompanyReKyc(
      req.params.id,
      trigger,
      req.user._id,
      details
    );

    res.json(result);
  } catch (error) {
    console.error('Trigger company re-KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rekyc/trigger/subcontractor/:id
 * Trigger re-KYC for a subcontractor
 */
router.post('/trigger/subcontractor/:id', auth(['ops', 'rmt', 'admin', 'founder']), async (req, res) => {
  try {
    const { trigger, details } = req.body;
    
    if (!trigger) {
      return res.status(400).json({ error: 'Trigger reason is required' });
    }

    const result = await reKycService.triggerSubContractorReKyc(
      req.params.id,
      trigger,
      req.user._id,
      details
    );

    res.json(result);
  } catch (error) {
    console.error('Trigger SC re-KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rekyc/nbfc-request
 * NBFC requests re-KYC for an entity
 */
router.post('/nbfc-request', auth(['nbfc', 'ops', 'admin', 'founder']), async (req, res) => {
  try {
    const { entityType, entityId, reason } = req.body;
    
    if (!entityType || !entityId || !reason) {
      return res.status(400).json({ error: 'entityType, entityId, and reason are required' });
    }

    // Get NBFC ID from user or body
    const nbfcId = req.body.nbfcId || req.user.nbfcId;

    const result = await reKycService.handleNbfcReKycRequest(
      entityType,
      entityId,
      nbfcId,
      reason,
      req.user._id
    );

    res.json(result);
  } catch (error) {
    console.error('NBFC re-KYC request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rekyc/complete/:entityType/:id
 * Complete re-KYC process
 */
router.post('/complete/:entityType/:id', auth(['ops', 'rmt', 'admin', 'founder']), async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { documents } = req.body;

    if (!['COMPANY', 'SUBCONTRACTOR'].includes(entityType.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const result = await reKycService.completeReKyc(
      entityType.toUpperCase(),
      id,
      req.user._id,
      documents
    );

    res.json(result);
  } catch (error) {
    console.error('Complete re-KYC error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rekyc/triggers
 * Get available re-KYC trigger reasons
 */
router.get('/triggers', auth(), async (req, res) => {
  res.json({
    success: true,
    triggers: reKycService.RE_KYC_TRIGGERS,
  });
});

module.exports = router;
