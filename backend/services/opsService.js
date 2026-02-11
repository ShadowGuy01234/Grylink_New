const Company = require('../models/Company');
const Document = require('../models/Document');
const Bill = require('../models/Bill');
const CwcRf = require('../models/CwcRf');
const Case = require('../models/Case');
const ChatMessage = require('../models/ChatMessage');
const cloudinary = require('../config/cloudinary');
const { sendStatusUpdate, sendKycRequest } = require('./emailService');

// Helper: upload buffer to Cloudinary via base64 data URI
const uploadToCloudinary = async (fileBuffer, mimeType, options = {}) => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder || 'gryork/kyc',
    resource_type: 'auto',
  });
};

// Step 6: Ops verifies EPC company documents
const verifyCompanyDocs = async (companyId, decision, notes, opsUserId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error('Company not found');
  if (company.status !== 'DOCS_SUBMITTED') throw new Error('Company documents not submitted yet');

  if (decision === 'approve') {
    company.status = 'ACTIVE';
    company.role = 'BUYER';
    company.verifiedBy = opsUserId;
    company.verifiedAt = new Date();
    company.verificationNotes = notes;
  } else {
    company.status = 'ACTION_REQUIRED';
    company.verificationNotes = notes;
  }

  company.statusHistory.push({
    status: company.status,
    changedBy: opsUserId,
    notes,
  });
  await company.save();

  // Send status update email
  await sendStatusUpdate(company.email, company.ownerName, 'Company', company.status, notes);

  return company;
};

// Step 12: Ops verifies bill
const verifyBill = async (billId, decision, notes, opsUserId) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new Error('Bill not found');
  if (bill.status !== 'UPLOADED') throw new Error('Bill is not in UPLOADED status');

  if (decision === 'approve') {
    bill.status = 'VERIFIED';
    bill.verifiedBy = opsUserId;
    bill.verifiedAt = new Date();
  } else {
    bill.status = 'REJECTED';
  }
  bill.verificationNotes = notes;
  bill.statusHistory.push({ status: bill.status, changedBy: opsUserId, notes });
  await bill.save();

  return bill;
};

// Step 14: Request KYC documents via chat
const requestKycDocs = async (cwcRfId, message, opsUserId) => {
  const cwcRf = await CwcRf.findById(cwcRfId).populate({
    path: 'userId',
    select: 'email name',
  });
  if (!cwcRf) throw new Error('CWC RF not found');

  cwcRf.status = 'ACTION_REQUIRED';
  cwcRf.statusHistory.push({ status: 'ACTION_REQUIRED', changedBy: opsUserId });
  await cwcRf.save();

  // Create chat message
  const chatMessage = new ChatMessage({
    cwcRfId,
    senderId: opsUserId,
    senderRole: 'ops',
    messageType: 'text',
    content: message,
  });
  await chatMessage.save();

  // Send email notification
  if (cwcRf.userId) {
    await sendKycRequest(cwcRf.userId.email, cwcRf.userId.name);
  }

  return { cwcRf, chatMessage };
};

// Step 14: Complete KYC
const completeKyc = async (cwcRfId, opsUserId) => {
  const cwcRf = await CwcRf.findById(cwcRfId);
  if (!cwcRf) throw new Error('CWC RF not found');

  cwcRf.status = 'KYC_COMPLETED';
  cwcRf.kycCompletedBy = opsUserId;
  cwcRf.kycCompletedAt = new Date();
  cwcRf.statusHistory.push({ status: 'KYC_COMPLETED', changedBy: opsUserId });
  await cwcRf.save();

  // Step 15: Create case after KYC completion
  const bill = await Bill.findById(cwcRf.billId);
  const caseDoc = new Case({
    billId: cwcRf.billId,
    subContractorId: cwcRf.subContractorId,
    epcId: bill.linkedEpcId,
    cwcRfId: cwcRf._id,
    status: 'READY_FOR_COMPANY_REVIEW',
    statusHistory: [{ status: 'READY_FOR_COMPANY_REVIEW', changedBy: opsUserId }],
  });
  await caseDoc.save();

  return { cwcRf, case: caseDoc };
};

// Get pending verifications for Ops dashboard
const getPendingVerifications = async () => {
  const [pendingCompanies, pendingBills, pendingKyc] = await Promise.all([
    Company.find({ status: 'DOCS_SUBMITTED' }).sort({ createdAt: 1 }),
    Bill.find({ status: 'UPLOADED' })
      .sort({ createdAt: 1 })
      .populate('subContractorId', 'companyName contactName')
      .populate('linkedEpcId', 'companyName'),
    CwcRf.find({ status: { $in: ['SUBMITTED', 'ACTION_REQUIRED'] } })
      .sort({ createdAt: 1 })
      .populate('subContractorId', 'companyName contactName')
      .populate('userId', 'name email'),
  ]);

  return { pendingCompanies, pendingBills, pendingKyc };
};

// Get chat messages for a CWC RF
const getChatMessages = async (cwcRfId) => {
  return ChatMessage.find({ cwcRfId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name role');
};

// Send chat message
const sendChatMessage = async (cwcRfId, senderId, senderRole, content, file) => {
  const messageData = {
    cwcRfId,
    senderId,
    senderRole,
    messageType: file ? 'file' : 'text',
    content,
  };

  if (file) {
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, { folder: 'gryork/kyc' });
    messageData.fileUrl = cloudResult.secure_url;
    messageData.cloudinaryPublicId = cloudResult.public_id;
    messageData.fileName = file.originalname;
  }

  const chatMessage = new ChatMessage(messageData);
  await chatMessage.save();
  return chatMessage;
};

module.exports = {
  verifyCompanyDocs,
  verifyBill,
  requestKycDocs,
  completeKyc,
  getPendingVerifications,
  getChatMessages,
  sendChatMessage,
};
