const Company = require('../models/Company');
const Document = require('../models/Document');
const Bill = require('../models/Bill');
const CwcRf = require('../models/CwcRf');
const Case = require('../models/Case');
const ChatMessage = require('../models/ChatMessage');
const GryLink = require('../models/GryLink');
const SubContractor = require('../models/SubContractor');
const User = require('../models/User');
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

// Get chat messages for a CWC RF with enhanced options
const getChatMessages = async (cwcRfId, options = {}) => {
  const { since, limit = 50 } = options;
  const query = { cwcRfId, isDeleted: { $ne: true } };
  
  if (since) {
    query.createdAt = { $gt: new Date(since) };
  }
  
  const messages = await ChatMessage.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('senderId', 'name role email')
    .populate('replyTo', 'content senderId senderRole createdAt')
    .populate('reactions.userId', 'name')
    .populate('readBy', 'name');

  // Transform messages to include attachments array (for frontend compatibility)
  return messages.map(msg => {
    const msgObj = msg.toObject();
    // Create attachments array if file exists
    if (msgObj.fileUrl) {
      msgObj.attachments = [{
        fileName: msgObj.fileName || 'document',
        fileUrl: msgObj.fileUrl,
        fileType: msgObj.fileType || 'application/octet-stream',
        thumbnailUrl: msgObj.thumbnailUrl,
      }];
    } else {
      msgObj.attachments = [];
    }
    return msgObj;
  });
};

// Send chat message with enhanced features
const sendChatMessage = async (cwcRfId, senderId, senderRole, content, file, options = {}) => {
  const { replyTo, actionType } = options;
  
  const messageData = {
    cwcRfId,
    senderId,
    senderRole: senderRole === 'admin' ? 'ops' : senderRole, // Normalize admin to ops
    messageType: file ? 'file' : (actionType ? 'action_required' : 'text'),
    content,
    status: 'sent',
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (actionType) {
    messageData.actionType = actionType;
  }

  if (file) {
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, { folder: 'gryork/kyc' });
    messageData.fileUrl = cloudResult.secure_url;
    messageData.cloudinaryPublicId = cloudResult.public_id;
    messageData.fileName = file.originalname;
    messageData.fileSize = file.size;
    messageData.fileType = file.mimetype;
    
    // Generate thumbnail for images
    if (file.mimetype.startsWith('image/')) {
      messageData.thumbnailUrl = cloudResult.eager?.[0]?.secure_url || cloudResult.secure_url;
    }
  }

  const chatMessage = new ChatMessage(messageData);
  await chatMessage.save();
  
  // Populate before returning
  await chatMessage.populate('senderId', 'name role email');
  if (replyTo) {
    await chatMessage.populate('replyTo', 'content senderId senderRole createdAt');
  }
  
  // Transform to include attachments array (for frontend compatibility)
  const msgObj = chatMessage.toObject();
  if (msgObj.fileUrl) {
    msgObj.attachments = [{
      fileName: msgObj.fileName || 'document',
      fileUrl: msgObj.fileUrl,
      fileType: msgObj.fileType || 'application/octet-stream',
      thumbnailUrl: msgObj.thumbnailUrl,
    }];
  } else {
    msgObj.attachments = [];
  }
  
  return msgObj;
};

// Mark messages as read
const markMessagesAsRead = async (cwcRfId, userId) => {
  const result = await ChatMessage.updateMany(
    { 
      cwcRfId, 
      senderId: { $ne: userId },
      isRead: false,
      isDeleted: { $ne: true }
    },
    { 
      $set: { isRead: true, readAt: new Date(), status: 'read' },
      $addToSet: { readBy: userId }
    }
  );
  
  return { modifiedCount: result.modifiedCount };
};

// Add reaction to message
const addReaction = async (messageId, userId, emoji) => {
  const validEmojis = ['👍', '✅', '❌', '⏳', '📄', '❓'];
  if (!validEmojis.includes(emoji)) {
    throw new Error('Invalid emoji');
  }
  
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');
  
  // Remove existing reaction from this user for the same emoji
  message.reactions = message.reactions.filter(
    r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
  
  // Add new reaction
  message.reactions.push({ emoji, userId, createdAt: new Date() });
  await message.save();
  
  return message.populate('reactions.userId', 'name');
};

// Remove reaction from message
const removeReaction = async (messageId, userId, emoji) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');
  
  message.reactions = message.reactions.filter(
    r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
  await message.save();
  
  return message.populate('reactions.userId', 'name');
};

// Edit message (only own messages, within 15 minutes)
const editMessage = async (messageId, userId, newContent) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error('You can only edit your own messages');
  }
  
  // Check if within edit window (15 minutes)
  const editWindow = 15 * 60 * 1000; // 15 minutes in ms
  if (Date.now() - message.createdAt.getTime() > editWindow) {
    throw new Error('Edit window has expired (15 minutes)');
  }
  
  if (!message.isEdited) {
    message.originalContent = message.content;
  }
  message.content = newContent;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();
  
  return message.populate('senderId', 'name role email');
};

// Soft delete message (only own messages)
const deleteMessage = async (messageId, userId) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error('You can only delete your own messages');
  }
  
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = userId;
  await message.save();
  
  return { deleted: true, messageId };
};

// Resolve action required message
const resolveAction = async (messageId, userId) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');
  if (message.messageType !== 'action_required') {
    throw new Error('This message is not an action item');
  }
  
  message.actionResolved = true;
  message.actionResolvedAt = new Date();
  message.actionResolvedBy = userId;
  await message.save();
  
  return message.populate(['senderId', 'actionResolvedBy']);
};

// Get unread count for a KYC chat
const getUnreadCount = async (cwcRfId, userId, userRole) => {
  // Count messages not sent by this user that are unread
  const count = await ChatMessage.countDocuments({
    cwcRfId,
    senderId: { $ne: userId },
    isRead: false,
    isDeleted: { $ne: true }
  });
  
  return count;
};

// Search messages within a KYC chat
const searchMessages = async (cwcRfId, query) => {
  if (!query || query.length < 2) {
    return [];
  }
  
  return ChatMessage.find({
    cwcRfId,
    isDeleted: { $ne: true },
    content: { $regex: query, $options: 'i' }
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('senderId', 'name role');
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

// Get pending bills for verification
const getPendingBills = async () => {
  return Bill.find({ status: { $in: ['UPLOADED', 'UNDER_REVIEW', 'PENDING_WCC', 'PENDING_MEASUREMENT'] } })
    .sort({ createdAt: 1 })
    .populate('subContractorId', 'companyName contactName email phone')
    .populate('linkedEpcId', 'companyName')
    .populate('uploadedBy', 'name email');
};

// Get bill details
const getBillDetails = async (billId) => {
  const bill = await Bill.findById(billId)
    .populate('subContractorId', 'companyName contactName email phone')
    .populate('linkedEpcId', 'companyName legalName')
    .populate('uploadedBy', 'name email')
    .populate('verifiedBy', 'name email')
    .populate('wcc.uploadedBy', 'name')
    .populate('wcc.verifiedBy', 'name')
    .populate('measurementSheet.uploadedBy', 'name')
    .populate('measurementSheet.certifiedBy', 'name');
  
  if (!bill) throw new Error('Bill not found');
  return bill;
};

// Add note to bill
const addBillNote = async (billId, text, userId) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new Error('Bill not found');
  
  if (!bill.notes) bill.notes = [];
  bill.notes.push({
    text,
    addedBy: userId,
    addedAt: new Date(),
  });
  
  await bill.save();
  return bill;
};

// Get pending KYC (sellers under review)
const getPendingKyc = async () => {
  const sellers = await SubContractor.find({ 
    $or: [
      { kycStatus: { $in: ['UNDER_REVIEW', 'DOCUMENTS_PENDING'] } },
      { status: { $in: ['KYC_PENDING', 'KYC_IN_PROGRESS'] } },
    ]
  })
    .sort({ createdAt: 1 })
    .populate('linkedEpcId', 'companyName')
    .populate('userId', 'name email');

  // Transform to match frontend expected format
  return sellers.map(seller => {
    const s = seller.toObject();
    
    // Transform kycDocuments from object to array format
    const kycDocArray = [];
    const docTypes = ['panCard', 'aadhaarCard', 'gstCertificate', 'cancelledCheque', 'incorporationCertificate', 'bankStatement'];
    for (const docType of docTypes) {
      const doc = s.kycDocuments?.[docType];
      if (doc?.fileUrl) {
        kycDocArray.push({
          _id: `${s._id}_${docType}`,
          type: docType,
          fileName: doc.fileName || docType,
          fileUrl: doc.fileUrl,
          status: doc.verified ? 'verified' : 'pending',
          uploadedAt: doc.uploadedAt,
        });
      }
    }
    
    return {
      _id: s._id,
      name: s.contactName || s.ownerName || s.companyName || s.userId?.name || 'Unknown',
      email: s.email || s.userId?.email || '',
      phone: s.phone,
      company: s.linkedEpcId ? {
        _id: s.linkedEpcId._id,
        companyName: s.linkedEpcId.companyName,
      } : null,
      kycStatus: s.kycStatus,
      kycDocuments: kycDocArray,
      createdAt: s.createdAt,
    };
  });
};

// Get seller KYC details
const getSellerKyc = async (sellerId) => {
  const seller = await SubContractor.findById(sellerId)
    .populate('linkedEpcId', 'companyName legalName')
    .populate('userId', 'name email')
    .populate('kycCompletedBy', 'name');
  
  if (!seller) throw new Error('Seller not found');
  
  const s = seller.toObject();
  
  // Transform kycDocuments from object to array format
  const kycDocArray = [];
  const docTypes = ['panCard', 'aadhaarCard', 'gstCertificate', 'cancelledCheque', 'incorporationCertificate', 'bankStatement'];
  for (const docType of docTypes) {
    const doc = s.kycDocuments?.[docType];
    if (doc?.fileUrl) {
      kycDocArray.push({
        _id: `${s._id}_${docType}`,
        type: docType,
        fileName: doc.fileName || docType,
        fileUrl: doc.fileUrl,
        status: doc.verified ? 'verified' : 'pending',
        uploadedAt: doc.uploadedAt,
      });
    }
  }
  
  return {
    _id: s._id,
    name: s.contactName || s.ownerName || s.companyName || s.userId?.name || 'Unknown',
    email: s.email || s.userId?.email || '',
    phone: s.phone,
    company: s.linkedEpcId ? {
      _id: s.linkedEpcId._id,
      companyName: s.linkedEpcId.companyName,
    } : null,
    kycStatus: s.kycStatus,
    kycDocuments: kycDocArray,
    createdAt: s.createdAt,
    kycCompletedAt: s.kycCompletedAt,
    kycCompletedBy: s.kycCompletedBy,
    kycNotes: s.kycNotes,
  };
};

// Verify seller KYC
const verifyKyc = async (sellerId, decision, notes, opsUserId) => {
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error('Seller not found');
  
  if (decision === 'approve') {
    seller.kycStatus = 'COMPLETED';
    seller.status = 'KYC_COMPLETED';
    seller.kycCompletedAt = new Date();
    seller.kycCompletedBy = opsUserId;
  } else {
    seller.kycStatus = 'REJECTED';
    seller.status = 'KYC_PENDING';
  }
  
  if (notes) {
    seller.kycNotes = notes;
  }
  
  await seller.save();
  
  // Send email notification
  if (seller.email) {
    await sendStatusUpdate(
      seller.email,
      seller.contactName || seller.companyName,
      decision === 'approve' 
        ? 'Your KYC verification has been approved!' 
        : `Your KYC verification was rejected. ${notes || ''}`,
      'KYC Verification Update'
    );
  }
  
  return seller;
};

// Verify individual KYC document
const verifyKycDocument = async (docId, decision, notes, opsUserId) => {
  // docId format: sellerId_docType (e.g., "abc123_panCard")
  const [sellerId, docType] = docId.split('_');
  
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error('Seller not found');
  
  const validDocTypes = ['panCard', 'aadhaarCard', 'gstCertificate', 'cancelledCheque', 'bankStatement', 'incorporationCertificate', 'msmeRegistration', 'photograph'];
  
  if (!validDocTypes.includes(docType)) {
    throw new Error('Invalid document type');
  }
  
  // Update document verification status
  if (seller.kycDocuments && seller.kycDocuments[docType]) {
    seller.kycDocuments[docType].verified = decision === 'approve';
    seller.kycDocuments[docType].verifiedBy = opsUserId;
    seller.kycDocuments[docType].verifiedAt = new Date();
    seller.kycDocuments[docType].verificationNotes = notes;
    seller.markModified('kycDocuments');
    await seller.save();
  } else {
    throw new Error(`Document ${docType} not found for this seller`);
  }
  
  return { 
    sellerId, 
    docType, 
    verified: decision === 'approve',
    notes 
  };
};

// Get SLA tracking items
const getSlaItems = async (filters = {}) => {
  const { type, status, priority } = filters;
  
  // Aggregate SLA items from different sources
  const [companies, bills, kyc] = await Promise.all([
    Company.find({ status: 'DOCS_SUBMITTED' }).sort({ createdAt: 1 }),
    Bill.find({ status: { $in: ['UPLOADED', 'UNDER_REVIEW'] } })
      .populate('subContractorId', 'companyName')
      .sort({ createdAt: 1 }),
    SubContractor.find({ kycStatus: 'UNDER_REVIEW' })
      .populate('linkedEpcId', 'companyName')
      .sort({ createdAt: 1 }),
  ]);
  
  const now = new Date();
  const items = [];
  
  // Add EPC verification items (24h SLA)
  companies.forEach(c => {
    const hoursOld = (now - c.createdAt) / (1000 * 60 * 60);
    const slaHours = 24;
    items.push({
      _id: c._id,
      type: 'epc',
      title: c.companyName,
      description: 'EPC document verification',
      createdAt: c.createdAt,
      slaHours,
      hoursRemaining: Math.max(0, slaHours - hoursOld),
      priority: hoursOld > slaHours ? 'critical' : hoursOld > slaHours * 0.75 ? 'high' : 'normal',
      status: hoursOld > slaHours ? 'overdue' : 'pending',
    });
  });
  
  // Add Bill verification items (48h SLA)
  bills.forEach(b => {
    const hoursOld = (now - b.createdAt) / (1000 * 60 * 60);
    const slaHours = 48;
    items.push({
      _id: b._id,
      type: 'bill',
      title: `Bill ${b.billNumber || b._id.toString().slice(-6)}`,
      description: b.subContractorId?.companyName || 'Bill verification',
      createdAt: b.createdAt,
      slaHours,
      hoursRemaining: Math.max(0, slaHours - hoursOld),
      priority: hoursOld > slaHours ? 'critical' : hoursOld > slaHours * 0.75 ? 'high' : 'normal',
      status: hoursOld > slaHours ? 'overdue' : 'pending',
    });
  });
  
  // Add KYC items (72h SLA)
  kyc.forEach(s => {
    const hoursOld = (now - s.createdAt) / (1000 * 60 * 60);
    const slaHours = 72;
    items.push({
      _id: s._id,
      type: 'kyc',
      title: s.companyName || s.contactName,
      description: `KYC verification - ${s.linkedEpcId?.companyName || 'N/A'}`,
      createdAt: s.createdAt,
      slaHours,
      hoursRemaining: Math.max(0, slaHours - hoursOld),
      priority: hoursOld > slaHours ? 'critical' : hoursOld > slaHours * 0.75 ? 'high' : 'normal',
      status: hoursOld > slaHours ? 'overdue' : 'pending',
    });
  });
  
  // Apply filters
  let filtered = items;
  if (type && type !== 'all') {
    filtered = filtered.filter(i => i.type === type);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(i => i.status === status);
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter(i => i.priority === priority);
  }
  
  // Sort by priority (critical first, then by hours remaining)
  filtered.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.hoursRemaining - b.hoursRemaining;
  });
  
  return filtered;
};

// Get SLA statistics
const getSlaStats = async () => {
  const items = await getSlaItems();
  
  return {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.status === 'overdue').length,
    critical: items.filter(i => i.priority === 'critical').length,
    byType: {
      epc: items.filter(i => i.type === 'epc').length,
      bill: items.filter(i => i.type === 'bill').length,
      kyc: items.filter(i => i.type === 'kyc').length,
    },
    avgHoursRemaining: items.length > 0 
      ? items.reduce((sum, i) => sum + i.hoursRemaining, 0) / items.length 
      : 0,
  };
};

// Get team workload distribution
const getTeamWorkload = async () => {
  const opsUsers = await User.find({ role: 'ops', isActive: true });
  
  // For now, return mock data since we don't have assignment tracking yet
  // In a real implementation, each item would have an assignedTo field
  return opsUsers.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    assigned: Math.floor(Math.random() * 15), // Mock data
    completed: Math.floor(Math.random() * 50),
    avgCompletionTime: Math.floor(Math.random() * 24) + 1,
  }));
};

module.exports = {
  verifyCompanyDocs,
  verifyBill,
  requestKycDocs,
  completeKyc,
  getPendingVerifications,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  resolveAction,
  getUnreadCount,
  searchMessages,
  getCompanyDocuments,
  verifyDocument,
  inviteNbfc,
  // New methods for dedicated pages
  getPendingBills,
  getBillDetails,
  addBillNote,
  getPendingKyc,
  getSellerKyc,
  verifyKyc,
  verifyKycDocument,
  getSlaItems,
  getSlaStats,
  getTeamWorkload,
};
