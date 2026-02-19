const SubContractor = require("../models/SubContractor");
const Company = require("../models/Company");
const Bill = require("../models/Bill");
const CwcRf = require("../models/CwcRf");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { sendSalesNotification } = require("./emailService");

// Helper: upload buffer to Cloudinary via base64 data URI
const uploadToCloudinary = async (fileBuffer, mimeType, options = {}) => {
  const b64 = Buffer.from(fileBuffer).toString("base64");
  const dataUri = `data:${mimeType || "application/octet-stream"};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder || "gryork/bills",
    resource_type: "auto",
  });
};

// Step 10: Sub-Contractor completes profile
const completeProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) {
    // Find by email if not yet linked
    subContractor = await SubContractor.findOne({ email: user.email });
  }

  if (!subContractor) throw new Error("Sub-contractor record not found");

  const {
    companyName,
    ownerName,
    address,
    phone,
    email,
    vendorId,
    gstin,
    selectedEpcId,
  } = data;

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
    if (epc && epc.status === "ACTIVE") {
      subContractor.selectedEpcId = selectedEpcId;
    } else if (!epc) {
      // New company lead — notify sales
      const salesAgent = await User.findById(subContractor.salesAgentId);
      if (salesAgent) {
        await sendSalesNotification(
          salesAgent.email,
          salesAgent.name,
          `Sub-contractor ${ownerName} has selected a new company that is not yet onboarded.`,
        );
      }
    }
  }

  subContractor.status = "PROFILE_COMPLETED";
  subContractor.statusHistory.push({
    status: "PROFILE_COMPLETED",
    changedBy: userId,
  });
  await subContractor.save();

  return subContractor;
};

// Step 11: Upload bill
const uploadBill = async (userId, files, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");
  if (subContractor.status !== "PROFILE_COMPLETED")
    throw new Error("Profile must be completed before uploading bills");

  if (!data.billNumber || !data.amount) {
    throw new Error("Bill number and amount are required");
  }

  const bills = [];
  for (const file of files) {
    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, {
      folder: "gryork/bills",
    });

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
      uploadMode: file.mimetype?.includes("sheet") ? "excel" : "image",
      status: "UPLOADED",
      statusHistory: [{ status: "UPLOADED", changedBy: userId }],
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
  if (!user) throw new Error("User not found");

  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const bill = await Bill.findById(billId);
  if (!bill) throw new Error("Bill not found");
  if (bill.status !== "VERIFIED")
    throw new Error("Bill must be verified before CWC submission");

  const cwcRf = new CwcRf({
    subContractorId: subContractor._id,
    userId,
    billId,
    platformFeePaid: !!paymentReference,
    paymentReference,
    status: "SUBMITTED",
    statusHistory: [{ status: "SUBMITTED", changedBy: userId }],
  });
  await cwcRf.save();

  return cwcRf;
};

// Step 18: Respond to bid
const respondToBid = async (userId, bidId, decision, counterOffer) => {
  const Bid = require("../models/Bid");
  const Case = require("../models/Case");

  const bid = await Bid.findById(bidId);
  if (!bid) throw new Error("Bid not found");

  const caseDoc = await Case.findById(bid.caseId);
  if (!caseDoc) throw new Error("Case not found");

  switch (decision) {
    case "accept":
      bid.status = "ACCEPTED";
      caseDoc.status = "COMMERCIAL_LOCKED";
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

    case "reject":
      bid.status = "REJECTED";
      caseDoc.status = "EPC_VERIFIED"; // Reset to allow new bids
      break;

    case "negotiate":
      bid.status = "NEGOTIATION_IN_PROGRESS";
      caseDoc.status = "NEGOTIATION_IN_PROGRESS";
      if (counterOffer) {
        bid.negotiations.push({
          counterAmount: counterOffer.amount,
          counterDuration: counterOffer.duration,
          proposedBy: userId,
          proposedByRole: "subcontractor",
          message: counterOffer.message,
        });
      }
      break;

    default:
      throw new Error("Invalid decision. Must be accept, reject, or negotiate");
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
    .populate("linkedEpcId", "companyName")
    .populate("selectedEpcId", "companyName");

  if (!subContractor) throw new Error("Sub-contractor not found");

  const Case = require("../models/Case");
  const Bid = require("../models/Bid");

  const [bills, cwcRfs, cases] = await Promise.all([
    Bill.find({ subContractorId: subContractor._id }).sort({ createdAt: -1 }),
    CwcRf.find({ subContractorId: subContractor._id }).sort({ createdAt: -1 }),
    Case.find({ subContractorId: subContractor._id })
      .populate("billId", "billNumber amount")
      .sort({ createdAt: -1 }),
  ]);

  // Get bids for this sub-contractor's cases
  const caseIds = cases.map((c) => c._id);
  const bids = await Bid.find({ caseId: { $in: caseIds } })
    .populate("epcId", "companyName")
    .sort({ createdAt: -1 });

  return { subContractor, bills, cwcRfs, cases, bids };
};

// Get incoming bids for sub-contractor
const getIncomingBids = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const Case = require("../models/Case");
  const Bid = require("../models/Bid");

  const cases = await Case.find({ subContractorId: subContractor._id });
  const caseIds = cases.map((c) => c._id);

  const bids = await Bid.find({ caseId: { $in: caseIds } })
    .populate("epcId", "companyName")
    .populate("nbfcId", "companyName")
    .populate({
      path: "caseId",
      populate: { path: "billId", select: "billNumber amount" },
    })
    .sort({ createdAt: -1 });

  return bids;
};

// Get cases for sub-contractor
const getCases = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const Case = require("../models/Case");

  const cases = await Case.find({ subContractorId: subContractor._id })
    .populate("billId", "billNumber amount fileUrl fileName")
    .populate("linkedEpcId", "companyName")
    .sort({ createdAt: -1 });

  return cases;
};

// Get all bills for sub-contractor
const getBills = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const bills = await Bill.find({ subContractorId: subContractor._id })
    .populate("companyId", "companyName")
    .sort({ createdAt: -1 });

  return bills;
};

// Upload WCC (Work Completion Certificate) - SOP Phase 6
const uploadWcc = async (userId, billId, file) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const bill = await Bill.findOne({
    _id: billId,
    subContractorId: subContractor._id,
  });
  if (!bill) throw new Error("Bill not found or access denied");

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file.buffer, file.mimetype, {
    folder: "gryork/wcc",
  });

  bill.wcc = {
    uploaded: true,
    fileName: file.originalname,
    fileUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    uploadedAt: new Date(),
    uploadedBy: userId,
    verified: false,
  };

  // Update bill status if measurement sheet is also uploaded
  if (bill.measurementSheet?.uploaded) {
    bill.status = "UNDER_REVIEW";
  } else {
    bill.status = "PENDING_MEASUREMENT";
  }

  bill.statusHistory.push({
    status: bill.status,
    changedAt: new Date(),
    changedBy: userId,
    notes: "WCC uploaded",
  });

  await bill.save();
  return bill;
};

// Upload Measurement Sheet - SOP Phase 6
const uploadMeasurementSheet = async (userId, billId, file) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const bill = await Bill.findOne({
    _id: billId,
    subContractorId: subContractor._id,
  });
  if (!bill) throw new Error("Bill not found or access denied");

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file.buffer, file.mimetype, {
    folder: "gryork/measurement-sheets",
  });

  bill.measurementSheet = {
    uploaded: true,
    fileName: file.originalname,
    fileUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    uploadedAt: new Date(),
    uploadedBy: userId,
    certified: false,
  };

  // Update bill status if WCC is also uploaded
  if (bill.wcc?.uploaded) {
    bill.status = "UNDER_REVIEW";
  } else {
    bill.status = "PENDING_WCC";
  }

  bill.statusHistory.push({
    status: bill.status,
    changedAt: new Date(),
    changedBy: userId,
    notes: "Measurement sheet uploaded",
  });

  await bill.save();
  return bill;
};

// ==================== SELLER DECLARATION ====================

// Accept seller declaration (Step 4 - Hard Gate)
const acceptDeclaration = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  if (subContractor.sellerDeclaration?.accepted) {
    throw new Error("Declaration already accepted");
  }

  subContractor.sellerDeclaration = {
    accepted: true,
    acceptedAt: new Date(),
    ipAddress: null, // Can be added from request
    declarationVersion: "1.0",
  };

  subContractor.statusHistory.push({
    status: "DECLARATION_ACCEPTED",
    changedBy: userId,
    notes: "Seller declaration accepted by user",
  });

  await subContractor.save();
  return { success: true, message: "Declaration accepted successfully" };
};

// Get declaration status
const getDeclarationStatus = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  return {
    declarationAccepted: subContractor.sellerDeclaration?.accepted || false,
    declarationAcceptedAt: subContractor.sellerDeclaration?.acceptedAt,
    declarationVersion: subContractor.sellerDeclaration?.declarationVersion,
  };
};

// ==================== KYC DOCUMENT MANAGEMENT ====================

// Upload KYC document
const uploadKycDocument = async (userId, documentType, file) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  // Validate document type
  const validTypes = [
    "panCard",
    "aadhaarCard",
    "gstCertificate",
    "cancelledCheque",
    "incorporationCertificate",
    "bankStatement",
  ];
  if (!validTypes.includes(documentType)) {
    throw new Error("Invalid document type");
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file.buffer, file.mimetype, {
    folder: `gryork/kyc/${subContractor._id}`,
  });

  // Initialize kycDocuments if not exists
  if (!subContractor.kycDocuments) {
    subContractor.kycDocuments = {};
  }

  // Update the specific document (matching model schema)
  subContractor.kycDocuments[documentType] = {
    fileName: file.originalname,
    fileUrl: result.secure_url,
    cloudinaryPublicId: result.public_id,
    uploadedAt: new Date(),
    verified: false,
  };

  // Recalculate KYC status (using model enum values)
  const requiredDocs = [
    "panCard",
    "aadhaarCard",
    "gstCertificate",
    "cancelledCheque",
  ];
  const uploadedRequired = requiredDocs.filter(
    (doc) => subContractor.kycDocuments[doc]?.fileUrl,
  ).length;

  if (uploadedRequired === requiredDocs.length) {
    // All required docs uploaded - check if all verified
    const allVerified = requiredDocs.every(
      (doc) => subContractor.kycDocuments[doc]?.verified === true,
    );
    subContractor.kycStatus = allVerified ? "COMPLETED" : "UNDER_REVIEW";
    subContractor.status = allVerified ? "KYC_COMPLETED" : "KYC_IN_PROGRESS";
  } else {
    subContractor.kycStatus = "DOCUMENTS_PENDING";
    subContractor.status = "KYC_PENDING";
  }

  subContractor.statusHistory.push({
    status: `KYC_DOC_${documentType.toUpperCase()}_UPLOADED`,
    changedBy: userId,
    notes: `KYC document ${documentType} uploaded`,
  });

  await subContractor.save();
  return {
    success: true,
    message: `${documentType} uploaded successfully`,
    kycStatus: subContractor.kycStatus,
  };
};

// Get KYC status
const getKycStatus = async (userId) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  // Format documents for response
  const documents = {};
  const docTypes = [
    "panCard",
    "aadhaarCard",
    "gstCertificate",
    "cancelledCheque",
    "incorporationCertificate",
    "bankStatement",
  ];

  for (const docType of docTypes) {
    const doc = subContractor.kycDocuments?.[docType];
    documents[docType] = {
      uploaded: !!doc?.fileUrl,
      url: doc?.fileUrl,
      fileName: doc?.fileName,
      status: doc?.verified
        ? "VERIFIED"
        : doc?.fileUrl
          ? "PENDING"
          : "NOT_UPLOADED",
      uploadedAt: doc?.uploadedAt,
    };
  }

  return {
    kycStatus: subContractor.kycStatus || "NOT_STARTED",
    documents,
    bankDetails: subContractor.bankDetails,
    bankDetailsVerified: subContractor.bankDetails?.verified || false,
  };
};

// ==================== BANK DETAILS ====================

// Update bank details
const updateBankDetails = async (userId, bankData) => {
  const subContractor = await SubContractor.findOne({ userId });
  if (!subContractor) throw new Error("Sub-contractor not found");

  const { accountNumber, ifscCode, bankName, branchName, accountHolderName } =
    bankData;

  if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
    throw new Error(
      "Account number, IFSC code, bank name, and account holder name are required",
    );
  }

  // Validate IFSC format
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    throw new Error("Invalid IFSC code format");
  }

  subContractor.bankDetails = {
    accountNumber,
    ifscCode,
    bankName,
    branchName,
    accountHolderName,
    verified: false, // Will be verified by ops team
    verifiedAt: null,
    verificationAttempts:
      (subContractor.bankDetails?.verificationAttempts || 0) + 1,
  };

  subContractor.statusHistory.push({
    status: "BANK_DETAILS_UPDATED",
    changedBy: userId,
    notes: `Bank details updated: ${bankName} - ${accountNumber.slice(-4)}`,
  });

  await subContractor.save();
  return {
    success: true,
    message: "Bank details saved successfully",
    bankDetails: {
      ...subContractor.bankDetails,
      accountNumber: `XXXX${accountNumber.slice(-4)}`, // Masked
    },
  };
};

module.exports = {
  completeProfile,
  uploadBill,
  submitCwcRf,
  respondToBid,
  getDashboard,
  getIncomingBids,
  getBills,
  getCases,
  uploadWcc,
  uploadMeasurementSheet,
  acceptDeclaration,
  getDeclarationStatus,
  uploadKycDocument,
  getKycStatus,
  updateBankDetails,
};
