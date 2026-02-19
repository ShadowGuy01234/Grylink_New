const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadChat } = require('../middleware/upload');
const opsService = require('../services/opsService');
const SubContractor = require('../models/SubContractor');

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

// POST /api/ops/kyc/:id/request-additional - Request an additional document from the SC
router.post(
  '/kyc/:id/request-additional',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { label, description } = req.body;
      if (!label) {
        return res.status(400).json({ error: 'Document label is required' });
      }
      const sc = await SubContractor.findById(req.params.id);
      if (!sc) {
        return res.status(404).json({ error: 'Sub-contractor not found' });
      }
      sc.additionalDocuments.push({
        label,
        description: description || '',
        requestedBy: req.user._id,
        requestedAt: new Date(),
      });
      await sc.save();
      res.json({ success: true, message: 'Additional document requested', additionalDocuments: sc.additionalDocuments });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/kyc/:id/verify-bank-details - Verify seller bank details
router.post(
  '/kyc/:id/verify-bank-details',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { decision, notes } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }
      const result = await opsService.verifyBankDetails(req.params.id, decision, notes, req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/kyc/:id/verify-additional/:docId - Verify an additional document
router.post(
  '/kyc/:id/verify-additional/:docId',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const { decision } = req.body;
      if (!decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be approve or reject' });
      }
      const result = await opsService.verifyAdditionalDocument(req.params.id, req.params.docId, decision, req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/ops/subcontractors - List all sub-contractors (for additional docs management)
router.get('/subcontractors', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const sellers = await SubContractor.find({})
      .select('companyName contactName email status additionalDocuments')
      .sort({ createdAt: -1 });
    res.json({ sellers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/pending - Get all pending verifications
router.get('/pending', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const pending = await opsService.getPendingVerifications();
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/bills/pending - Get pending bills for verification
router.get('/bills/pending', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const bills = await opsService.getPendingBills();
    res.json({ bills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/bills/:id - Get bill details
router.get('/bills/:id', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const bill = await opsService.getBillDetails(req.params.id);
    res.json({ bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ops/bills/:id/notes - Add note to bill
router.post('/bills/:id/notes', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const { text } = req.body;
    const bill = await opsService.addBillNote(req.params.id, text, req.user._id);
    res.json({ bill });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/ops/kyc/pending - Get pending KYC items
router.get('/kyc/pending', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const sellers = await opsService.getPendingKyc();
    res.json({ sellers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/kyc/:id - Get seller KYC details (must be before /kyc/:id/chat)
router.get('/kyc/:id', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const seller = await opsService.getSellerKyc(req.params.id);
    res.json({ seller });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ops/kyc/:id/verify - Verify seller KYC
router.post('/kyc/:id/verify', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const { decision, notes } = req.body;
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approve or reject' });
    }
    const seller = await opsService.verifyKyc(req.params.id, decision, notes, req.user._id);
    res.json({ seller });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/ops/kyc/documents/:id/verify - Verify individual KYC document
router.post('/kyc/documents/:id/verify', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const { decision, notes } = req.body;
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approve or reject' });
    }
    const result = await opsService.verifyKycDocument(req.params.id, decision, notes, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/ops/sla - Get SLA tracking items
router.get('/sla', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const { type, status, priority } = req.query;
    const items = await opsService.getSlaItems({ type, status, priority });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/sla/stats - Get SLA statistics
router.get('/sla/stats', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const stats = await opsService.getSlaStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/team/workload - Get team workload distribution
router.get('/team/workload', authenticate, authorize('ops', 'admin'), async (req, res) => {
  try {
    const workload = await opsService.getTeamWorkload();
    res.json({ workload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ops/kyc/:id/chat - Get KYC chat messages with full details
router.get('/kyc/:id/chat', authenticate, authorize('ops', 'admin', 'subcontractor'), async (req, res) => {
  try {
    const { since, limit = 50 } = req.query;
    const messages = await opsService.getChatMessages(req.params.id, { since, limit: parseInt(limit) });
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
        req.file,
        {
          replyTo: req.body.replyTo,
          actionType: req.body.actionType,
        }
      );
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/kyc/:id/chat/read - Mark messages as read
router.post(
  '/kyc/:id/chat/read',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const result = await opsService.markMessagesAsRead(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/chat/:messageId/reaction - Add reaction to message
router.post(
  '/chat/:messageId/reaction',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const { emoji } = req.body;
      const message = await opsService.addReaction(req.params.messageId, req.user._id, emoji);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE /api/ops/chat/:messageId/reaction - Remove reaction from message
router.delete(
  '/chat/:messageId/reaction',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const { emoji } = req.body;
      const message = await opsService.removeReaction(req.params.messageId, req.user._id, emoji);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// PUT /api/ops/chat/:messageId - Edit message
router.put(
  '/chat/:messageId',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const { content } = req.body;
      const message = await opsService.editMessage(req.params.messageId, req.user._id, content);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE /api/ops/chat/:messageId - Soft delete message
router.delete(
  '/chat/:messageId',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const message = await opsService.deleteMessage(req.params.messageId, req.user._id);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/ops/chat/:messageId/resolve - Resolve action required message
router.post(
  '/chat/:messageId/resolve',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const message = await opsService.resolveAction(req.params.messageId, req.user._id);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/ops/kyc/:id/chat/unread - Get unread count
router.get(
  '/kyc/:id/chat/unread',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const count = await opsService.getUnreadCount(req.params.id, req.user._id, req.user.role);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/ops/kyc/:id/chat/search - Search messages
router.get(
  '/kyc/:id/chat/search',
  authenticate,
  authorize('ops', 'admin', 'subcontractor'),
  async (req, res) => {
    try {
      const { q } = req.query;
      const messages = await opsService.searchMessages(req.params.id, q);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

// POST /api/ops/nbfc/invite - Invite NBFC
router.post(
  '/nbfc/invite',
  authenticate,
  authorize('ops', 'admin'),
  async (req, res) => {
    try {
      const result = await opsService.inviteNbfc(req.body, req.user._id);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
