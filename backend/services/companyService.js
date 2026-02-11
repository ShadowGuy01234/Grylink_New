const Company = require("../models/Company");
const Document = require("../models/Document");
const SubContractor = require("../models/SubContractor");
const GryLink = require("../models/GryLink");
const XLSX = require("xlsx");
const cloudinary = require("../config/cloudinary");
const { sendStatusUpdate, sendOnboardingLink } = require("./emailService");
const authService = require("./authService");

// Helper: upload buffer to Cloudinary via base64 data URI
const uploadToCloudinary = async (fileBuffer, mimeType, options = {}) => {
  const b64 = Buffer.from(fileBuffer).toString("base64");
  const dataUri = `data:${mimeType || "application/octet-stream"};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder || "gryork/documents",
    resource_type: options.resource_type || "auto",
  });
};

// Step 5: EPC uploads documents
const uploadDocuments = async (companyId, files, documentTypes, userId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");

  const documents = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(file.buffer, file.mimetype, {
      folder: "gryork/documents",
    });

    const doc = new Document({
      companyId,
      uploadedBy: userId,
      documentType: documentTypes[i] || "OTHER",
      fileName: file.originalname,
      fileUrl: cloudResult.secure_url,
      cloudinaryPublicId: cloudResult.public_id,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
    await doc.save();
    documents.push(doc);
  }

  // Update company status
  company.status = "DOCS_SUBMITTED";
  company.statusHistory.push({ status: "DOCS_SUBMITTED", changedBy: userId });
  await company.save();

  return documents;
};

// Get company profile with documents
const getCompanyProfile = async (companyId) => {
  const [company, documents] = await Promise.all([
    Company.findById(companyId)
      .populate("salesAgentId", "name email")
      .populate("userId", "name email"),
    Document.find({ companyId }).sort({ createdAt: -1 }),
  ]);

  if (!company) throw new Error("Company not found");
  return { company, documents };
};

// Step 7 Option A: Manual sub-contractor entry
const addSubContractors = async (companyId, subContractors, userId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");
  if (company.status !== "ACTIVE")
    throw new Error("Company must be ACTIVE to add sub-contractors");

  const created = [];
  for (const sc of subContractors) {
    const existing = await SubContractor.findOne({
      email: sc.email,
      linkedEpcId: companyId,
    });
    if (existing) continue;

    const subContractor = new SubContractor({
      companyName: sc.companyName,
      contactName: sc.contactName,
      email: sc.email,
      phone: sc.phone,
      linkedEpcId: companyId,
      salesAgentId: company.salesAgentId,
      status: "LEAD_CREATED",
      statusHistory: [{ status: "LEAD_CREATED", changedBy: userId }],
    });
    await subContractor.save();

    // Create user account for sub-contractor
    const user = await authService.createSubContractorUser({
      name: sc.contactName || sc.companyName,
      email: sc.email,
      phone: sc.phone,
      subContractorId: subContractor._id,
    });
    subContractor.userId = user._id;
    await subContractor.save();

    // Generate GryLink and send onboarding email
    const gryLink = new GryLink({
      subContractorId: subContractor._id,
      salesAgentId: company.salesAgentId,
      email: sc.email,
      linkType: "subcontractor",
    });
    await gryLink.save();

    // Send onboarding email
    const link = `${process.env.SUBCONTRACTOR_PORTAL_URL || process.env.GRYLINK_FRONTEND_URL}/onboarding/${gryLink.token}`;
    await sendOnboardingLink(sc.email, sc.contactName || sc.companyName, link);

    created.push(subContractor);
  }

  return created;
};

// Step 7 Option B: Bulk Excel upload
const bulkAddSubContractors = async (companyId, fileBuffer, userId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");
  if (company.status !== "ACTIVE")
    throw new Error("Company must be ACTIVE to add sub-contractors");

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const results = { created: [], errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.email) {
        results.errors.push({ row: i + 2, error: "Email is required" });
        continue;
      }

      const existing = await SubContractor.findOne({
        email: row.email.toLowerCase().trim(),
        linkedEpcId: companyId,
      });
      if (existing) {
        results.errors.push({ row: i + 2, error: "Duplicate email" });
        continue;
      }

      const contactName = row.contactName || row.contact_name || "";
      const companyName = row.companyName || row.company_name || "";

      const subContractor = new SubContractor({
        companyName,
        contactName,
        email: row.email,
        phone: row.phone || "",
        linkedEpcId: companyId,
        salesAgentId: company.salesAgentId,
        status: "LEAD_CREATED",
        statusHistory: [{ status: "LEAD_CREATED", changedBy: userId }],
      });
      await subContractor.save();

      // Create user account for sub-contractor
      const user = await authService.createSubContractorUser({
        name: contactName || companyName,
        email: row.email,
        phone: row.phone || "",
        subContractorId: subContractor._id,
      });
      subContractor.userId = user._id;
      await subContractor.save();

      // Generate GryLink and send onboarding email
      const gryLink = new GryLink({
        subContractorId: subContractor._id,
        salesAgentId: company.salesAgentId,
        email: row.email,
        linkType: "subcontractor",
      });
      await gryLink.save();

      // Send onboarding email
      const link = `${process.env.SUBCONTRACTOR_PORTAL_URL || process.env.GRYLINK_FRONTEND_URL}/onboarding/${gryLink.token}`;
      await sendOnboardingLink(row.email, contactName || companyName, link);

      results.created.push(subContractor);
    } catch (error) {
      results.errors.push({ row: i + 2, error: error.message });
    }
  }

  return results;
};

// Get all sub-contractors for a company
const getSubContractors = async (companyId) => {
  return SubContractor.find({ linkedEpcId: companyId })
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
};

module.exports = {
  uploadDocuments,
  getCompanyProfile,
  addSubContractors,
  bulkAddSubContractors,
  getSubContractors,
};
