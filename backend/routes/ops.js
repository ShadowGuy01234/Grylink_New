const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadChat } = require('../middleware/upload');
const opsService = require('../services/opsService');

// POST /api/ops/companies/:id/verify - Verify company docs (Step 6)
router.post(
  '/companies/:id/verify',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { decision, notes } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }

      const company = await opsService.verifyCompanyDocs(
        req.params.id,
        decision,
        notes,
        req.user._id
      );
      res.json(company);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/bills/:id/verify - Verify bill (Step 12)
router.post(
  '/bills/:id/verify',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { decision, notes } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }

      const bill = await opsService.verifyBill(req.params.id, decision, notes, req.user._id);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/kyc/:id/request - Request KYC docs (Step 14)
router.post(
  '/kyc/:id/request',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await opsService.requestKycDocs(req.params.id, message, req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/kyc/:id/complete - Complete KYC (Step 14)
router.post(
  '/kyc/:id/complete',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const result = await opsService.completeKyc(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/ops/pending - Get all pending verifications
router.get('/pending', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const pending = await opsService.getPendingVerifications();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/kyc/:id/chat - Get KYC chat messages
router.get('/kyc/:id/chat', authenticate, authorize('ops', 'admin', 'subcontractor'), async (req, res) => {
  try {
    const messages = await opsService.getChatMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ops/kyc/:id/chat - Send KYC chat message
router.post(
  '/kyc/:id/chat',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  uploadChat.single('file'),
  async (req, res) => {
    try {
      const message = await opsService.sendChatMessage(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body.content,
        req.file
      );
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/ops/companies/:id/documents - Get company documents
router.get('/companies/:id/documents', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const docs = await opsService.getCompanyDocuments(req.params.id);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ops/documents/:id/verify - Verify single document
router.post(
  '/documents/:id/verify',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { decision, notes } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }

      const doc = await opsService.verifyDocument(req.params.id, decision, notes, req.user._id);
      res.json(doc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
