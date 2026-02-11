const Bid = require("../models/Bid");
const Case = require("../models/Case");
const SubContractor = require("../models/SubContractor");
const User = require("../models/User");
const { sendBidNotification } = require("./emailService");

// Step 17: EPC places bid
const placeBid = async (
  caseId,
  epcId,
  userId,
  bidAmount,
  fundingDurationDays,
) => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error("Case not found");
  if (caseDoc.status !== "EPC_VERIFIED")
    throw new Error("Case must be EPC_VERIFIED to place a bid");

  const bid = new Bid({
    caseId,
    epcId,
    placedBy: userId,
    bidAmount,
    fundingDurationDays,
    status: "SUBMITTED",
    statusHistory: [{ status: "SUBMITTED", changedBy: userId }],
  });
  await bid.save();

  // Update case status
  caseDoc.status = "BID_PLACED";
  caseDoc.statusHistory.push({ status: "BID_PLACED", changedBy: userId });
  await caseDoc.save();

  // Notify sub-contractor
  const subContractor = await SubContractor.findById(caseDoc.subContractorId);
  if (subContractor && subContractor.userId) {
    const scUser = await User.findById(subContractor.userId);
    if (scUser) {
      await sendBidNotification(
        scUser.email,
        scUser.name,
        caseDoc.caseNumber,
        bidAmount,
        fundingDurationDays,
      );
    }
  }

  return { bid, case: caseDoc };
};

// Step 19: Negotiate
const negotiate = async (bidId, userId, counterOffer) => {
  const bid = await Bid.findById(bidId);
  if (!bid) throw new Error("Bid not found");

  if (!["SUBMITTED", "NEGOTIATION_IN_PROGRESS"].includes(bid.status)) {
    throw new Error("Bid is not available for negotiation");
  }

  const user = await User.findById(userId);
  const proposedByRole = user.role === "epc" ? "epc" : "subcontractor";

  bid.status = "NEGOTIATION_IN_PROGRESS";
  bid.negotiations.push({
    counterAmount: counterOffer.amount,
    counterDuration: counterOffer.duration,
    proposedBy: userId,
    proposedByRole,
    message: counterOffer.message,
  });
  bid.statusHistory.push({
    status: "NEGOTIATION_IN_PROGRESS",
    changedBy: userId,
  });
  await bid.save();

  // Update case status
  const caseDoc = await Case.findById(bid.caseId);
  if (caseDoc && caseDoc.status !== "NEGOTIATION_IN_PROGRESS") {
    caseDoc.status = "NEGOTIATION_IN_PROGRESS";
    caseDoc.statusHistory.push({
      status: "NEGOTIATION_IN_PROGRESS",
      changedBy: userId,
    });
    await caseDoc.save();
  }

  return bid;
};

// Step 19: Lock commercial agreement
const lockCommercial = async (bidId, userId) => {
  const bid = await Bid.findById(bidId);
  if (!bid) throw new Error("Bid not found");

  if (!["SUBMITTED", "NEGOTIATION_IN_PROGRESS"].includes(bid.status)) {
    throw new Error("Bid cannot be locked in current status");
  }

  // Get final terms from last negotiation or original bid
  const lastNegotiation = bid.negotiations[bid.negotiations.length - 1];
  const finalAmount = lastNegotiation
    ? lastNegotiation.counterAmount
    : bid.bidAmount;
  const finalDuration = lastNegotiation
    ? lastNegotiation.counterDuration
    : bid.fundingDurationDays;

  bid.status = "COMMERCIAL_LOCKED";
  bid.lockedTerms = {
    finalAmount,
    finalDuration,
    lockedAt: new Date(),
  };
  bid.statusHistory.push({ status: "COMMERCIAL_LOCKED", changedBy: userId });
  await bid.save();

  // Update case
  const caseDoc = await Case.findById(bid.caseId);
  if (caseDoc) {
    caseDoc.status = "COMMERCIAL_LOCKED";
    caseDoc.lockedAt = new Date();
    caseDoc.commercialSnapshot = {
      bidId: bid._id,
      finalAmount,
      finalDuration,
      lockedAt: new Date(),
    };
    caseDoc.statusHistory.push({
      status: "COMMERCIAL_LOCKED",
      changedBy: userId,
    });
    await caseDoc.save();
  }

  return { bid, case: caseDoc };
};

// Get bids for a case
const getBidsForCase = async (caseId) => {
  return Bid.find({ caseId })
    .sort({ createdAt: -1 })
    .populate("placedBy", "name email")
    .populate("epcId", "companyName");
};

// Get a specific bid by ID
const getBid = async (bidId) => {
  const bid = await Bid.findById(bidId)
    .populate("placedBy", "name email")
    .populate("epcId", "companyName")
    .populate("caseId");
  if (!bid) throw new Error("Bid not found");
  return bid;
};

// Get my bids (for EPC/NBFC)
const getMyBids = async (companyId, role) => {
  const query = role === "nbfc" ? { nbfcId: companyId } : { epcId: companyId };
  return Bid.find(query)
    .sort({ createdAt: -1 })
    .populate("epcId", "companyName")
    .populate("nbfcId", "companyName")
    .populate({
      path: "caseId",
      populate: [
        { path: "subContractorId", select: "companyName ownerName" },
        { path: "billId", select: "billNumber amount" },
      ],
    });
};

module.exports = {
  placeBid,
  negotiate,
  lockCommercial,
  getBidsForCase,
  getMyBids,
  getBid,
};
