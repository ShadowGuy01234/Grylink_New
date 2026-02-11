const SubContractor = require('../models/SubContractor');
const Company = require('../models/Company');
const Bill = require('../models/Bill');
const CwcRf = require('../models/CwcRf');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendSalesNotification } = require('./emailService');

// Helper: upload buffer to Cloudinary via base64 data URI
const uploadToCloudinary = async (fileBuffer, mimeType, options = {}) => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder || 'gryork/bills',
    resource_type: 'auto',
  });
};

// Step 10: Sub-Contractor completes profile
const completeProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  let subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) {
    // Find by email if not yet linked
    subContractor = await SubContractor.findOne({ email: user.email });
  }

  if (!subContractor) throw new Error('Sub-contractor record not found');

  const { companyName, ownerName, address, phone, email, vendorId, gstin, selectedEpcId } = data;

  // Update profile
  subContractor.companyName = companyName || subContractor.companyName;
  subContractor.ownerName = ownerName;
  subContractor.address = address;
  subContractor.phone = phone;
  subContractor.email = email || subContractor.email;
  subContractor.vendorId = vendorId;
  subContractor.gstin = gstin;
  subContractor.userId = userId;

  // Company selection
  if (selectedEpcId) {
    const epc = await Company.findById(selectedEpcId);
    if (epc && epc.status === 'ACTIVE') {
      subContractor.selectedEpcId = selectedEpcId;
    } else if (!epc) {
      // New company lead — notify sales
      const salesAgent = await User.findById(subContractor.salesAgentId);
      if (salesAgent) {
        await sendSalesNotification(
          salesAgent.email,
          salesAgent.name,
          `Sub-contractor ${ownerName} has selected a new company that is not yet onboarded.`
        );
      }
    }
  }

  subContractor.status = 'PROFILE_COMPLETED';
  subContractor.statusHistory.push({ status: 'PROFILE_COMPLETED', changedBy: userId });
  await subContractor.save();

  return subContractor;
};

// Step 11: Upload bill
const uploadBill = async (userId, files, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error('Sub-contractor not found');
  if (subContractor.status !== 'PROFILE_COMPLETED')
    throw new Error('Profile must be completed before uploading bills');

  const bills = [];
  for (const file of files) {
    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, { folder: 'gryork/bills' });

    const bill = new Bill({
      subContractorId: subContractor._id,
      uploadedBy: userId,
      linkedEpcId: subContractor.linkedEpcId,
      billNumber: data.billNumber,
      amount: data.amount,
      description: data.description,
      fileName: file.originalname,
      fileUrl: cloudResult.secure_url,
      cloudinaryPublicId: cloudResult.public_id,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadMode: file.mimetype?.includes('sheet') ? 'excel' : 'image',
      status: 'UPLOADED',
      statusHistory: [{ status: 'UPLOADED', changedBy: userId }],
    });
    await bill.save();
    bills.push(bill);
  }

  return bills;
};

// Step 13: Submit CWC RF
const submitCwcRf = async (userId, data) => {
  const { billId, paymentReference } = data;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error('Sub-contractor not found');

  const bill = await Bill.findById(billId);
  if (!bill) throw new Error('Bill not found');
  if (bill.status !== 'VERIFIED') throw new Error('Bill must be verified before CWC submission');

  const cwcRf = new CwcRf({
    subContractorId: subContractor._id,
    userId,
    billId,
    platformFeePaid: !!paymentReference,
    paymentReference,
    status: 'SUBMITTED',
    statusHistory: [{ status: 'SUBMITTED', changedBy: userId }],
  });
  await cwcRf.save();

  return cwcRf;
};

// Step 18: Respond to bid
const respondToBid = async (userId, bidId, decision, counterOffer) => {
  const Bid = require('../models/Bid');
  const Case = require('../models/Case');

  const bid = await Bid.findById(bidId);
  if (!bid) throw new Error('Bid not found');

  const caseDoc = await Case.findById(bid.caseId);
  if (!caseDoc) throw new Error('Case not found');

  switch (decision) {
    case 'accept':
      bid.status = 'ACCEPTED';
      caseDoc.status = 'COMMERCIAL_LOCKED';
      bid.lockedTerms = {
        finalAmount: bid.bidAmount,
        finalDuration: bid.fundingDurationDays,
        lockedAt: new Date(),
      };
      caseDoc.lockedAt = new Date();
      caseDoc.commercialSnapshot = {
        bidAmount: bid.bidAmount,
        fundingDuration: bid.fundingDurationDays,
        lockedAt: new Date(),
      };
      break;

    case 'reject':
      bid.status = 'REJECTED';
      caseDoc.status = 'EPC_VERIFIED'; // Reset to allow new bids
      break;

    case 'negotiate':
      bid.status = 'NEGOTIATION_IN_PROGRESS';
      caseDoc.status = 'NEGOTIATION_IN_PROGRESS';
      if (counterOffer) {
        bid.negotiations.push({
          counterAmount: counterOffer.amount,
          counterDuration: counterOffer.duration,
          proposedBy: userId,
          proposedByRole: 'subcontractor',
          message: counterOffer.message,
        });
      }
      break;

    default:
      throw new Error('Invalid decision. Must be accept, reject, or negotiate');
  }

  bid.statusHistory.push({ status: bid.status, changedBy: userId });
  caseDoc.statusHistory.push({ status: caseDoc.status, changedBy: userId });

  await bid.save();
  await caseDoc.save();

  return { bid, case: caseDoc };
};

// Get sub-contractor dashboard data
const getDashboard = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId })
    .populate('linkedEpcId', 'companyName')
    .populate('selectedEpcId', 'companyName');

  if (!subContractor) throw new Error('Sub-contractor not found');

  const Case = require('../models/Case');
  const Bid = require('../models/Bid');

  const [bills, cwcRfs, cases] = await Promise.all([
    Bill.find({ subContractorId: subContractor._id }).sort({ createdAt: -1 }),
    CwcRf.find({ subContractorId: subContractor._id }).sort({ createdAt: -1 }),
    Case.find({ subContractorId: subContractor._id })
      .populate('billId', 'billNumber amount')
      .sort({ createdAt: -1 }),
  ]);

  // Get bids for this sub-contractor's cases
  const caseIds = cases.map(c => c._id);
  const bids = await Bid.find({ caseId: { $in: caseIds } })
    .populate('epcId', 'companyName')
    .sort({ createdAt: -1 });

  return { subContractor, bills, cwcRfs, cases, bids };
};

// Get incoming bids for sub-contractor
const getIncomingBids = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error('Sub-contractor not found');

  const Case = require('../models/Case');
  const Bid = require('../models/Bid');

  const cases = await Case.find({ subContractorId: subContractor._id });
  const caseIds = cases.map(c => c._id);

  const bids = await Bid.find({ caseId: { $in: caseIds } })
    .populate('epcId', 'companyName')
    .populate('nbfcId', 'companyName')
    .populate({
      path: 'caseId',
      populate: { path: 'billId', select: 'billNumber amount' }
    })
    .sort({ createdAt: -1 });

  return bids;
};

// Get cases for sub-contractor
const getCases = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error('Sub-contractor not found');

  const Case = require('../models/Case');
  
  const cases = await Case.find({ subContractorId: subContractor._id })
    .populate('billId', 'billNumber amount fileUrl fileName')
    .populate('linkedEpcId', 'companyName')
    .sort({ createdAt: -1 });

  return cases;
};

module.exports = {
  completeProfile,
  uploadBill,
  submitCwcRf,
  respondToBid,
  getDashboard,
  getIncomingBids,
  getCases,
};
