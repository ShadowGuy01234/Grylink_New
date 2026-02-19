const Company = require("../models/Company");
const Document = require("../models/Document");
const Bill = require("../models/Bill");
const SubContractor = require("../models/SubContractor");
const { sendStatusUpdate } = require("./emailService");

const verifyCompanyDocs = async (companyId, decision, notes, opsUserId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");
  if (company.status !== "DOCS_SUBMITTED")
    throw new Error("Company documents not submitted yet");

  if (decision === "approve") {
    company.status = "ACTIVE";
    company.role = "BUYER";
    company.verifiedBy = opsUserId;
    company.verifiedAt = new Date();
    company.verificationNotes = notes;
  } else {
    company.status = "ACTION_REQUIRED";
    company.verificationNotes = notes;
  }

  company.statusHistory.push({
    status: company.status,
    changedBy: opsUserId,
    notes,
  });
  await company.save();

  // Send status update email
  await sendStatusUpdate(
    company.email,
    company.ownerName,
    "Company",
    company.status,
    notes,
  );

  return company;
};

const verifyBill = async (billId, decision, notes, opsUserId) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new Error("Bill not found");
  if (bill.status !== "UPLOADED")
    throw new Error("Bill is not in UPLOADED status");

  if (decision === "approve") {
    bill.status = "VERIFIED";
    bill.verifiedBy = opsUserId;
    bill.verifiedAt = new Date();
  } else {
    bill.status = "REJECTED";
  }
  bill.verificationNotes = notes;
  bill.statusHistory.push({ status: bill.status, changedBy: opsUserId, notes });
  await bill.save();

  return bill;
};

const verifyDocument = async (docId, decision, notes, opsUserId) => {
  const doc = await Document.findById(docId);
  if (!doc) throw new Error("Document not found");

  if (decision === "approve") {
    doc.status = "verified";
    doc.verifiedBy = opsUserId;
    doc.verifiedAt = new Date();
  } else {
    doc.status = "rejected";
  }
  doc.verificationNotes = notes;
  await doc.save();
  return doc;
};

const verifyKycDocument = async (docId, decision, notes, opsUserId) => {
  // docId format: sellerId_docType (e.g., "abc123_panCard")
  const [sellerId, docType] = docId.split("_");

  const seller = await SubContractor.findById(sellerId);
  if (!seller) throw new Error("Seller not found");

  const validDocTypes = [
    "panCard",
    "aadhaarCard",
    "gstCertificate",
    "cancelledCheque",
    "bankStatement",
    "incorporationCertificate",
    "msmeRegistration",
    "photograph",
  ];

  if (!validDocTypes.includes(docType)) {
    throw new Error("Invalid document type");
  }

  // Update document verification status
  if (seller.kycDocuments && seller.kycDocuments[docType]) {
    seller.kycDocuments[docType].verified = decision === "approve";
    seller.kycDocuments[docType].verifiedBy = opsUserId;
    seller.kycDocuments[docType].verifiedAt = new Date();
    seller.kycDocuments[docType].verificationNotes = notes;
    seller.markModified("kycDocuments");
    await seller.save();
  } else {
    throw new Error(`Document ${docType} not found for this seller`);
  }

  return {
    sellerId,
    docType,
    verified: decision === "approve",
    notes,
  };
};

module.exports = {
  verifyCompanyDocs,
  verifyBill,
  verifyDocument,
  verifyKycDocument,
};
