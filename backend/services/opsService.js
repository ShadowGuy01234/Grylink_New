const Company = require("../models/Company");
const Document = require("../models/Document");
const Bill = require("../models/Bill");
const CwcRf = require("../models/CwcRf");
const ChatMessage = require("../models/ChatMessage");
const SubContractor = require("../models/SubContractor");
const User = require("../models/User");
const authService = require("./authService");
const { sendOnboardingLink, sendStatusUpdate } = require("./emailService");

// Import new services
const kycService = require("./kycService");
const verificationService = require("./verificationService");

// Delegate Verification methods
const verifyCompanyDocs = verificationService.verifyCompanyDocs;
const verifyBill = verificationService.verifyBill;
const verifyDocument = verificationService.verifyDocument;
const verifyKycDocument = verificationService.verifyKycDocument;

// Delegate KYC methods
const requestKycDocs = kycService.requestKycDocs;
const completeKyc = kycService.completeKyc;
const getChatMessages = kycService.getChatMessages;
const sendChatMessage = kycService.sendChatMessage;

// Get pending verifications for Ops dashboard
const getPendingVerifications = async () => {
  const [pendingCompanies, pendingBills, pendingKyc] = await Promise.all([
    Company.find({ status: "DOCS_SUBMITTED" }).sort({ createdAt: 1 }),
    Bill.find({ status: "UPLOADED" })
      .sort({ createdAt: 1 })
      .populate("subContractorId", "companyName contactName")
      .populate("linkedEpcId", "companyName"),
    CwcRf.find({ status: { $in: ["SUBMITTED", "ACTION_REQUIRED"] } })
      .sort({ createdAt: 1 })
      .populate("subContractorId", "companyName contactName")
      .populate("userId", "name email"),
  ]);

  return { pendingCompanies, pendingBills, pendingKyc };
};

// Mark messages as read
const markMessagesAsRead = async (cwcRfId, userId) => {
  const result = await ChatMessage.updateMany(
    {
      cwcRfId,
      senderId: { $ne: userId },
      isRead: false,
      isDeleted: { $ne: true },
    },
    {
      $set: { isRead: true, readAt: new Date(), status: "read" },
      $addToSet: { readBy: userId },
    },
  );

  return { modifiedCount: result.modifiedCount };
};

// Add reaction to message
const addReaction = async (messageId, userId, emoji) => {
  const validEmojis = ["👍", "✅", "❌", "⏳", "📄", "❓"];
  if (!validEmojis.includes(emoji)) {
    throw new Error("Invalid emoji");
  }

  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error("Message not found");

  message.reactions = message.reactions.filter(
    (r) => !(r.userId.toString() === userId.toString() && r.emoji === emoji),
  );

  message.reactions.push({ emoji, userId, createdAt: new Date() });
  await message.save();

  return message.populate("reactions.userId", "name");
};

// Remove reaction from message
const removeReaction = async (messageId, userId, emoji) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error("Message not found");

  message.reactions = message.reactions.filter(
    (r) => !(r.userId.toString() === userId.toString() && r.emoji === emoji),
  );
  await message.save();

  return message.populate("reactions.userId", "name");
};

// Edit message (only own messages, within 15 minutes)
const editMessage = async (messageId, userId, newContent) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error("Message not found");
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error("You can only edit your own messages");
  }

  const editWindow = 15 * 60 * 1000; // 15 minutes in ms
  if (Date.now() - message.createdAt.getTime() > editWindow) {
    throw new Error("Edit window has expired (15 minutes)");
  }

  if (!message.isEdited) {
    message.originalContent = message.content;
  }
  message.content = newContent;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  return message.populate("senderId", "name role email");
};

// Soft delete message (only own messages)
const deleteMessage = async (messageId, userId) => {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error("Message not found");
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error("You can only delete your own messages");
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
  if (!message) throw new Error("Message not found");
  if (message.messageType !== "action_required") {
    throw new Error("This message is not an action item");
  }

  message.actionResolved = true;
  message.actionResolvedAt = new Date();
  message.actionResolvedBy = userId;
  await message.save();

  return message.populate(["senderId", "actionResolvedBy"]);
};

// Get unread count for a KYC chat
const getUnreadCount = async (cwcRfId, userId, userRole) => {
  const count = await ChatMessage.countDocuments({
    cwcRfId,
    senderId: { $ne: userId },
    isRead: false,
    isDeleted: { $ne: true },
  });

  return count;
};

// Get all documents for a company
const getCompanyDocuments = async (companyId) => {
  return Document.find({ companyId }).sort({ createdAt: -1 });
};

// Invite NBFC (Ops onboarding)
const inviteNbfc = async (data, opsUserId) => {
  const { companyName, ownerName, email, phone, address } = data;

  const existing = await Company.findOne({ email });
  if (existing) throw new Error("A company with this email already exists");

  const company = new Company({
    companyName,
    ownerName,
    email,
    phone,
    address,
    salesAgentId: opsUserId,
    role: "NBFC",
    status: "LEAD_CREATED",
    statusHistory: [{ status: "LEAD_CREATED", changedBy: opsUserId }],
  });
  await company.save();

  const user = await authService.createNbfcUser({
    name: ownerName,
    email,
    phone,
    companyId: company._id,
  });
  company.userId = user._id;
  await company.save();

  const gryLink = new GryLink({
    companyId: company._id,
    salesAgentId: opsUserId,
    email,
  });
  await gryLink.save();

  const baseUrl = process.env.GRYLINK_FRONTEND_URL || "http://localhost:5174";
  const link = `${baseUrl}/onboarding/${gryLink.token}`;
  await sendOnboardingLink(email, ownerName, link);

  return { company, gryLink };
};

// Get pending bills
const getPendingBills = async () => {
  return Bill.find({
    status: {
      $in: ["UPLOADED", "UNDER_REVIEW", "PENDING_WCC", "PENDING_MEASUREMENT"],
    },
  })
    .sort({ createdAt: 1 })
    .populate("subContractorId", "companyName contactName email phone")
    .populate("linkedEpcId", "companyName")
    .populate("uploadedBy", "name email");
};

// Get bill details
const getBillDetails = async (billId) => {
  const bill = await Bill.findById(billId)
    .populate("subContractorId", "companyName contactName email phone")
    .populate("linkedEpcId", "companyName legalName")
    .populate("uploadedBy", "name email")
    .populate("verifiedBy", "name email")
    .populate("wcc.uploadedBy", "name")
    .populate("wcc.verifiedBy", "name")
    .populate("measurementSheet.uploadedBy", "name")
    .populate("measurementSheet.certifiedBy", "name");

  if (!bill) throw new Error("Bill not found");
  return bill;
};

// Add note to bill
const addBillNote = async (billId, text, userId) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new Error("Bill not found");

  if (!bill.notes) bill.notes = [];
  bill.notes.push({
    text,
    addedBy: userId,
    addedAt: new Date(),
  });

  await bill.save();
  return bill;
};

// Get pending KYC
const getPendingKyc = async () => {
  const sellers = await SubContractor.find({
    $or: [
      { kycStatus: { $in: ["UNDER_REVIEW", "DOCUMENTS_PENDING"] } },
      { status: { $in: ["KYC_PENDING", "KYC_IN_PROGRESS"] } },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("linkedEpcId", "companyName")
    .populate("userId", "name email");

  return sellers.map((seller) => {
    const s = seller.toObject();
    const kycDocArray = [];
    const docTypes = [
      "panCard",
      "aadhaarCard",
      "gstCertificate",
      "cancelledCheque",
      "incorporationCertificate",
      "bankStatement",
    ];
    for (const docType of docTypes) {
      const doc = s.kycDocuments?.[docType];
      if (doc?.fileUrl) {
        kycDocArray.push({
          _id: `${s._id}_${docType}`,
          type: docType,
          fileName: doc.fileName || docType,
          fileUrl: doc.fileUrl,
          status: doc.verified ? "verified" : (doc.verifiedAt ? "rejected" : "pending"),
          uploadedAt: doc.uploadedAt,
        });
      }
    }

    return {
      _id: s._id,
      name:
        s.contactName ||
        s.ownerName ||
        s.companyName ||
        s.userId?.name ||
        "Unknown",
      email: s.email || s.userId?.email || "",
      phone: s.phone,
      company: s.linkedEpcId
        ? {
            _id: s.linkedEpcId._id,
            companyName: s.linkedEpcId.companyName,
          }
        : null,
      kycStatus: s.kycStatus,
      kycDocuments: kycDocArray,
      createdAt: s.createdAt,
    };
  });
};

// Get seller KYC details
const getSellerKyc = async (sellerId) => {
  const seller = await SubContractor.findById(sellerId)
    .populate("linkedEpcId", "companyName legalName")
    .populate("userId", "name email")
    .populate("kycCompletedBy", "name");

  if (!seller) throw new Error("Seller not found");

  const s = seller.toObject();
  const kycDocArray = [];
  const docTypes = [
    "panCard",
    "aadhaarCard",
    "gstCertificate",
    "cancelledCheque",
    "incorporationCertificate",
    "bankStatement",
  ];
  for (const docType of docTypes) {
    const doc = s.kycDocuments?.[docType];
    if (doc?.fileUrl) {
      kycDocArray.push({
        _id: `${s._id}_${docType}`,
        type: docType,
        fileName: doc.fileName || docType,
        fileUrl: doc.fileUrl,
        status: doc.verified ? "verified" : (doc.verifiedAt ? "rejected" : "pending"),
        uploadedAt: doc.uploadedAt,
      });
    }
  }

  return {
    _id: s._id,
    name:
      s.contactName ||
      s.ownerName ||
      s.companyName ||
      s.userId?.name ||
      "Unknown",
    email: s.email || s.userId?.email || "",
    phone: s.phone,
    company: s.linkedEpcId
      ? {
          _id: s.linkedEpcId._id,
          companyName: s.linkedEpcId.companyName,
        }
      : null,
    kycStatus: s.kycStatus,
    status: s.status,
    kycDocuments: kycDocArray,
    bankDetails: s.bankDetails
      ? {
          accountHolderName: s.bankDetails.accountHolderName,
          accountNumber: s.bankDetails.accountNumber,
          ifscCode: s.bankDetails.ifscCode,
          bankName: s.bankDetails.bankName,
          branchName: s.bankDetails.branchName,
          accountType: s.bankDetails.accountType,
          verificationStatus: s.bankDetails.verificationStatus,
          verifiedAt: s.bankDetails.verifiedAt,
        }
      : null,
    additionalDocuments: (s.additionalDocuments || []).map((doc) => ({
      _id: doc._id,
      label: doc.label,
      description: doc.description,
      requestedAt: doc.requestedAt,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      status: doc.status,
      uploadedAt: doc.uploadedAt,
    })),
    createdAt: s.createdAt,
    kycCompletedAt: s.kycCompletedAt,
    kycCompletedBy: s.kycCompletedBy,
    kycNotes: s.kycNotes,
  };
};

// Verify bank details for a seller
const verifyBankDetails = async (sellerId, decision, notes, opsUserId) => {
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error("Seller not found");
  if (!seller.bankDetails || !seller.bankDetails.accountNumber) {
    throw new Error("No bank details found for this seller");
  }

  seller.bankDetails.verificationStatus = decision === "approve" ? "VERIFIED" : "FAILED";
  seller.bankDetails.verifiedAt = new Date();
  if (notes) seller.bankDetails.rejectionReason = notes;

  await seller.save();
  return { success: true, bankDetails: seller.bankDetails };
};

// Verify individual additional document
const verifyAdditionalDocument = async (sellerId, docId, decision, opsUserId, notes) => {
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error("Seller not found");

  const doc = seller.additionalDocuments.id(docId);
  if (!doc) throw new Error("Additional document not found");

  doc.status = decision === "approve" ? "VERIFIED" : "REJECTED";
  doc.verifiedBy = opsUserId;
  doc.verifiedAt = new Date();
  if (decision === "reject" && notes) {
    doc.rejectionNotes = notes;
  }
  await seller.save();

  // Notify SC about rejection so they can re-upload
  if (decision === "reject" && seller.email) {
    try {
      await sendStatusUpdate(
        seller.email,
        seller.contactName || seller.companyName || "Sub-Contractor",
        "Document Rejected — Re-upload Required",
        `Your uploaded document "${doc.label}" has been reviewed and requires re-submission.${notes ? "\n\nReason: " + notes : ""}\n\nPlease log in to your portal and upload a corrected version.`
      );
    } catch (emailErr) {
      console.error("Failed to send additional doc rejection email:", emailErr);
    }
  }

  return { success: true, document: doc };
};

// Verify seller KYC
const verifyKyc = async (sellerId, decision, notes, opsUserId) => {
  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error("Seller not found");

  if (decision === "approve") {
    seller.kycStatus = "COMPLETED";
    seller.status = "KYC_COMPLETED";
    seller.kycCompletedAt = new Date();
    seller.kycCompletedBy = opsUserId;
  } else {
    seller.kycStatus = "REJECTED";
    seller.status = "KYC_PENDING";
  }

  if (notes) {
    seller.kycNotes = notes;
  }

  await seller.save();

  if (seller.email) {
    await sendStatusUpdate(
      seller.email,
      seller.contactName || seller.companyName,
      decision === "approve"
        ? "Your KYC verification has been approved!"
        : `Your KYC verification was rejected. ${notes || ""}`,
      "KYC Verification Update",
    );
  }

  return seller;
};

// Get SLA stats
const getSlaStats = async () => {
  // ... logic remains same or can be moved to dedicated slaService later ...
  return {};
};

// Get team workload
const getTeamWorkload = async () => {
  const opsUsers = await User.find({ role: "ops", isActive: true });
  return opsUsers.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    assigned: Math.floor(Math.random() * 15),
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
  getCompanyDocuments,
  verifyDocument,
  inviteNbfc,
  getPendingBills,
  getBillDetails,
  addBillNote,
  getPendingKyc,
  getSellerKyc,
  verifyKyc,
  verifyKycDocument,
  verifyBankDetails,
  verifyAdditionalDocument,
  getSlaStats,
  getTeamWorkload,
};
