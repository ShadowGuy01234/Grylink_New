const Transaction = require('../models/Transaction');
const Case = require('../models/Case');
const Bill = require('../models/Bill');
const Nbfc = require('../models/Nbfc');
const Sla = require('../models/Sla');

// Create a transaction when NBFC approves
const createTransaction = async (data) => {
  const { caseId, billIds, nbfcId, approvedBy, approvalDetails } = data;

  const caseDoc = await Case.findById(caseId).populate('seller buyer');
  if (!caseDoc) throw new Error('Case not found');

  const nbfc = await Nbfc.findById(nbfcId);
  if (!nbfc) throw new Error('NBFC not found');

  const bills = await Bill.find({ _id: { $in: billIds } });
  const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  // Calculate funding (60-70% as per SOP)
  const fundingPercentage = approvalDetails?.fundingPercentage || 65;
  const fundedAmount = totalAmount * (fundingPercentage / 100);
  const interestRate = approvalDetails?.interestRate || nbfc.preferredInterestRate || 12;

  const transaction = new Transaction({
    case: caseId,
    bills: billIds,
    nbfc: nbfcId,
    seller: caseDoc.seller._id,
    buyer: caseDoc.buyer._id,
    totalAmount,
    fundedAmount,
    fundingPercentage,
    interestRate,
    tenorDays: approvalDetails?.tenorDays || 30,
    status: 'APPROVED',
    approvedBy,
    approvedAt: new Date(),
    escrow: {
      status: 'NOT_SETUP',
    },
  });
  await transaction.save();

  // Update case status
  caseDoc.status = 'NBFC_APPROVED';
  caseDoc.nbfc = nbfcId;
  caseDoc.transactionId = transaction._id;
  await caseDoc.save();

  return transaction;
};

// Setup TRA/Escrow account
const setupEscrow = async (transactionId, escrowDetails) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  transaction.escrow = {
    status: 'SETUP',
    depositAccount: escrowDetails.depositAccount,
    accountHolderName: escrowDetails.accountHolderName,
    bank: escrowDetails.bank,
    ifsc: escrowDetails.ifsc,
    beneficiaryAccount: escrowDetails.beneficiaryAccount,
    setupAt: new Date(),
    notes: escrowDetails.notes,
  };
  transaction.status = 'ESCROW_SETUP';
  await transaction.save();

  return transaction;
};

// Initiate disbursement to seller
const initiateDisbursement = async (transactionId, disbursementData) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');
  if (transaction.escrow.status !== 'SETUP') {
    throw new Error('Escrow must be setup before disbursement');
  }

  transaction.disbursement = {
    amount: transaction.fundedAmount,
    disbursedAt: new Date(),
    referenceNumber: disbursementData.referenceNumber,
    status: 'INITIATED',
    paymentMode: disbursementData.paymentMode || 'RTGS',
    toAccount: disbursementData.toAccount,
    notes: disbursementData.notes,
  };
  transaction.status = 'DISBURSED';
  await transaction.save();

  return transaction;
};

// Track repayment (buyer pays to escrow)
const trackRepayment = async (transactionId, repaymentData) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const expectedAmount = transaction.totalAmount;
  const totalPaid = transaction.repayment?.amountReceived || 0;
  const newPayment = repaymentData.amount;

  transaction.repayment = {
    ...transaction.repayment,
    amountReceived: totalPaid + newPayment,
    paymentDate: new Date(),
    referenceNumber: repaymentData.referenceNumber,
    lastPaymentAmount: newPayment,
    paymentHistory: [
      ...(transaction.repayment?.paymentHistory || []),
      {
        amount: newPayment,
        date: new Date(),
        referenceNumber: repaymentData.referenceNumber,
      },
    ],
  };

  // Check if fully repaid
  if (totalPaid + newPayment >= expectedAmount) {
    transaction.repayment.status = 'COMPLETED';
    transaction.status = 'COMPLETED';
    transaction.completedAt = new Date();

    // Update NBFC metrics
    await Nbfc.findByIdAndUpdate(transaction.nbfc, {
      $inc: {
        'metrics.totalDisbursed': transaction.fundedAmount,
        'metrics.totalCasesHandled': 1,
        'metrics.approvedCases': 1,
      },
    });
  } else {
    transaction.repayment.status = 'PARTIAL';
  }

  await transaction.save();
  return transaction;
};

// Handle overdue (buyer didn't pay on time)
const handleOverdue = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const dueDate = new Date(transaction.disbursement?.disbursedAt);
  dueDate.setDate(dueDate.getDate() + transaction.tenorDays);

  if (new Date() > dueDate && transaction.status !== 'COMPLETED') {
    const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));

    transaction.status = 'OVERDUE';
    transaction.repayment = {
      ...transaction.repayment,
      status: 'OVERDUE',
      daysOverdue,
      overdueDate: dueDate,
    };

    // Mark recourse if overdue > 7 days (as per SOP)
    if (daysOverdue > 7) {
      transaction.recourse = {
        isActive: true,
        triggeredAt: new Date(),
        reason: `Overdue by ${daysOverdue} days`,
        recourseOn: transaction.seller, // Seller is responsible
      };
    }

    await transaction.save();
  }

  return transaction;
};

// Get transactions for a user
const getTransactions = async (filters = {}) => {
  const query = {};
  if (filters.nbfc) query.nbfc = filters.nbfc;
  if (filters.seller) query.seller = filters.seller;
  if (filters.buyer) query.buyer = filters.buyer;
  if (filters.status) query.status = filters.status;

  return await Transaction.find(query)
    .populate('case', 'caseNumber')
    .populate('nbfc', 'name')
    .populate('seller', 'name companyName')
    .populate('buyer', 'name')
    .sort({ createdAt: -1 });
};

// Get transaction details
const getTransactionById = async (transactionId) => {
  return await Transaction.findById(transactionId)
    .populate('case')
    .populate('bills')
    .populate('nbfc')
    .populate('seller')
    .populate('buyer')
    .populate('approvedBy', 'name');
};

// Get overdue transactions (for cron job)
const getOverdueTransactions = async () => {
  const today = new Date();
  return await Transaction.find({
    status: { $in: ['DISBURSED', 'OVERDUE'] },
    'repayment.status': { $ne: 'COMPLETED' },
  }).populate('case seller buyer nbfc');
};

module.exports = {
  createTransaction,
  setupEscrow,
  initiateDisbursement,
  trackRepayment,
  handleOverdue,
  getTransactions,
  getTransactionById,
  getOverdueTransactions,
};
