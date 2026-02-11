const Company = require('../models/Company');
const SubContractor = require('../models/SubContractor');
const GryLink = require('../models/GryLink');
const { sendOnboardingLink } = require('./emailService');
const authService = require('./authService');

// Step 3: Sales creates a company lead
const createCompanyLead = async (data, salesAgentId) => {
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
    salesAgentId,
    status: 'LEAD_CREATED',
    statusHistory: [{ status: 'LEAD_CREATED', changedBy: salesAgentId }],
  });
  await company.save();

  // Step 4: Generate GryLink and create EPC user
  const user = await authService.createEpcUser({
    name: ownerName,
    email,
    phone,
    companyId: company._id,
  });
  company.userId = user._id;
  await company.save();

  const gryLink = new GryLink({
    companyId: company._id,
    salesAgentId,
    email,
  });
  await gryLink.save();

  // Send onboarding email
  const link = `${process.env.GRYLINK_FRONTEND_URL}/onboarding/${gryLink.token}`;
  await sendOnboardingLink(email, ownerName, link);

  return { company, gryLink };
};

// Get all leads for a sales agent
const getLeads = async (salesAgentId) => {
  return Company.find({ salesAgentId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email');
};

// Get sub-contractor leads for a sales agent
const getSubContractorLeads = async (salesAgentId) => {
  return SubContractor.find({ salesAgentId })
    .sort({ createdAt: -1 })
    .populate('linkedEpcId', 'companyName')
    .populate('userId', 'name email');
};

// Mark sub-contractor as contacted
const markSubContractorContacted = async (subContractorId, salesAgentId, notes) => {
  const subContractor = await SubContractor.findById(subContractorId);
  if (!subContractor) throw new Error('Sub-contractor not found');
  
  // Verify sales agent owns this SC
  if (subContractor.salesAgentId?.toString() !== salesAgentId.toString()) {
    throw new Error('Unauthorized to update this sub-contractor');
  }

  subContractor.contactedAt = new Date();
  subContractor.contactedBy = salesAgentId;
  subContractor.contactNotes = notes || '';
  subContractor.statusHistory.push({
    status: 'CONTACTED',
    changedBy: salesAgentId,
    notes,
  });
  await subContractor.save();

  return subContractor;
};

// Get dashboard stats
const getDashboardStats = async (salesAgentId) => {
  const [companies, subContractors] = await Promise.all([
    Company.aggregate([
      { $match: { salesAgentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    SubContractor.aggregate([
      { $match: { salesAgentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return { companies, subContractors };
};

module.exports = {
  createCompanyLead,
  getLeads,
  getSubContractorLeads,
  markSubContractorContacted,
  getDashboardStats,
};
