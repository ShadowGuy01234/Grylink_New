const Company = require('../models/Company');
const Document = require('../models/Document');
const Bill = require('../models/Bill');
const CwcRf = require('../models/CwcRf');
const Case = require('../models/Case');
const ChatMessage = require('../models/ChatMessage');
const GryLink = require('../models/GryLink');
const authService = require('./authService');
const cloudinary = require('../config/cloudinary');
const { sendStatusUpdate, sendKycRequest, sendOnboardingLink } = require('./emailService');

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

// Get all documents for a company
const getCompanyDocuments = async (companyId) => {
  return Document.find({ companyId }).sort({ createdAt: -1 });
};

// Verify a single document
const verifyDocument = async (docId, decision, notes, opsUserId) => {
  const doc = await Document.findById(docId);
  if (!doc) throw new Error('Document not found');

  if (decision === 'approve') {
    doc.status = 'verified';
    doc.verifiedBy = opsUserId;
    doc.verifiedAt = new Date();
  } else {
    doc.status = 'rejected';
  }
  doc.verificationNotes = notes;
  await doc.save();
  return doc;
};

// Invite NBFC (Ops onboarding)
const inviteNbfc = async (data, opsUserId) => {
  const { companyName, ownerName, email, phone, address } = data;

  // Check if company already exists
  const existing = await Company.findOne({ email });
  if (existing) throw new Error('A company with this email already exists');

  const company = new Company({
    companyName,
    ownerName,
    email,
    phone,
    address,
    salesAgentId: opsUserId, // Ops user acts as sales agent here
    role: 'NBFC', // Explicitly set role
    status: 'LEAD_CREATED',
    statusHistory: [{ status: 'LEAD_CREATED', changedBy: opsUserId }],
  });
  await company.save();

  // Create NBFC user
  const user = await authService.createNbfcUser({
    name: ownerName,
    email,
    phone,
    companyId: company._id,
  });
  company.userId = user._id;
  await company.save();

  // Generate onboarding link
  const gryLink = new GryLink({
    companyId: company._id,
    salesAgentId: opsUserId,
    email,
  });
  await gryLink.save();

  // Send onboarding email — uses grylink-portal which handles password setup
  // and then redirects to partner-portal after onboarding is complete
  const baseUrl = process.env.GRYLINK_FRONTEND_URL || 'http://localhost:5174';
  const link = `${baseUrl}/onboarding/${gryLink.token}`;
  await sendOnboardingLink(email, ownerName, link);

  return { company, gryLink };
};

module.exports = {
  verifyCompanyDocs,
  verifyBill,
  requestKycDocs,
  completeKyc,
  getPendingVerifications,
  getChatMessages,
  sendChatMessage,
  getCompanyDocuments,
  verifyDocument,
  inviteNbfc,
};
