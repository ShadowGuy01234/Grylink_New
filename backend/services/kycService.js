const CwcRf = require("../models/CwcRf");
const ChatMessage = require("../models/ChatMessage");
const Bill = require("../models/Bill");
const Case = require("../models/Case");
const SubContractor = require("../models/SubContractor");
const { sendKycRequest, sendStatusUpdate } = require("./emailService");
const { uploadToCloudinary } = require("./cloudinaryService");

const requestKycDocs = async (cwcRfId, message, opsUserId) => {
  const cwcRf = await CwcRf.findById(cwcRfId).populate({
    path: "userId",
    select: "email name",
  });
  if (!cwcRf) throw new Error("CWC RF not found");

  cwcRf.status = "ACTION_REQUIRED";
  cwcRf.statusHistory.push({ status: "ACTION_REQUIRED", changedBy: opsUserId });
  await cwcRf.save();

  // Create chat message
  const chatMessage = new ChatMessage({
    cwcRfId,
    senderId: opsUserId,
    senderRole: "ops",
    messageType: "text",
    content: message,
  });
  await chatMessage.save();

  // Send email notification
  if (cwcRf.userId) {
    await sendKycRequest(cwcRf.userId.email, cwcRf.userId.name);
  }

  return { cwcRf, chatMessage };
};

const completeKyc = async (cwcRfId, opsUserId) => {
  const cwcRf = await CwcRf.findById(cwcRfId);
  if (!cwcRf) throw new Error("CWC RF not found");

  cwcRf.status = "KYC_COMPLETED";
  cwcRf.kycCompletedBy = opsUserId;
  cwcRf.kycCompletedAt = new Date();
  cwcRf.statusHistory.push({ status: "KYC_COMPLETED", changedBy: opsUserId });
  await cwcRf.save();

  // Create case after KYC completion
  const bill = await Bill.findById(cwcRf.billId);
  const caseDoc = new Case({
    billId: cwcRf.billId,
    subContractorId: cwcRf.subContractorId,
    epcId: bill.linkedEpcId,
    cwcRfId: cwcRf._id,
    status: "READY_FOR_COMPANY_REVIEW",
    statusHistory: [
      { status: "READY_FOR_COMPANY_REVIEW", changedBy: opsUserId },
    ],
  });
  await caseDoc.save();

  return { cwcRf, case: caseDoc };
};

const getChatMessages = async (cwcRfId, options = {}) => {
  const { since, limit = 50 } = options;
  const query = { cwcRfId, isDeleted: { $ne: true } };

  if (since) {
    query.createdAt = { $gt: new Date(since) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("senderId", "name role email")
    .populate("replyTo", "content senderId senderRole createdAt")
    .populate("reactions.userId", "name")
    .populate("readBy", "name");

  return messages.map((msg) => {
    const msgObj = msg.toObject();
    if (msgObj.fileUrl) {
      msgObj.attachments = [
        {
          fileName: msgObj.fileName || "document",
          fileUrl: msgObj.fileUrl,
          fileType: msgObj.fileType || "application/octet-stream",
          thumbnailUrl: msgObj.thumbnailUrl,
        },
      ];
    } else {
      msgObj.attachments = [];
    }
    return msgObj;
  });
};

const sendChatMessage = async (
  cwcRfId,
  senderId,
  senderRole,
  content,
  file,
  options = {},
) => {
  const { replyTo, actionType } = options;

  const messageData = {
    cwcRfId,
    senderId,
    senderRole: senderRole === "admin" ? "ops" : senderRole,
    messageType: file ? "file" : actionType ? "action_required" : "text",
    content,
    status: "sent",
  };

  if (replyTo) messageData.replyTo = replyTo;
  if (actionType) messageData.actionType = actionType;

  if (file) {
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, {
      folder: "gryork/kyc",
    });
    messageData.fileUrl = cloudResult.secure_url;
    messageData.cloudinaryPublicId = cloudResult.public_id;
    messageData.fileName = file.originalname;
    messageData.fileSize = file.size;
    messageData.fileType = file.mimetype;

    if (file.mimetype.startsWith("image/")) {
      messageData.thumbnailUrl =
        cloudResult.eager?.[0]?.secure_url || cloudResult.secure_url;
    }
  }

  const chatMessage = new ChatMessage(messageData);
  await chatMessage.save();
  await chatMessage.populate("senderId", "name role email");
  if (replyTo)
    await chatMessage.populate(
      "replyTo",
      "content senderId senderRole createdAt",
    );

  const msgObj = chatMessage.toObject();
  if (msgObj.fileUrl) {
    msgObj.attachments = [
      {
        fileName: msgObj.fileName || "document",
        fileUrl: msgObj.fileUrl,
        fileType: msgObj.fileType || "application/octet-stream",
        thumbnailUrl: msgObj.thumbnailUrl,
      },
    ];
  } else {
    msgObj.attachments = [];
  }

  return msgObj;
};

// ... other chat related functions (mark read, etc.) could go here,
// keeping it simpler for this refactor step.

module.exports = {
  requestKycDocs,
  completeKyc,
  getChatMessages,
  sendChatMessage,
};
