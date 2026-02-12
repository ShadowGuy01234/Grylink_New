const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const transactionService = require('../services/transactionService');

// Create transaction (when NBFC approves)
router.post('/', authenticate, authorize('nbfc', 'ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction({
      ...req.body,
      approvedBy: req.user.id,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get transactions (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.user.role === 'nbfc') filters.nbfc = req.user.companyId;
    if (req.user.role === 'subcontractor') filters.seller = req.user.id;
    if (req.user.role === 'epc') filters.buyer = req.user.companyId;
    if (req.query.status) filters.status = req.query.status;

    const transactions = await transactionService.getTransactions(filters);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overdue transactions (Ops)
router.get('/overdue', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transactions = await transactionService.getOverdueTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Setup escrow/TRA
router.post('/:id/escrow', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transaction = await transactionService.setupEscrow(req.params.id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Initiate disbursement
router.post('/:id/disburse', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transaction = await transactionService.initiateDisbursement(req.params.id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Track repayment
router.post('/:id/repayment', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transaction = await transactionService.trackRepayment(req.params.id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark overdue
router.post('/:id/overdue', authenticate, authorize('ops', 'admin', 'founder'), async (req, res) => {
  try {
    const transaction = await transactionService.handleOverdue(req.params.id);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
