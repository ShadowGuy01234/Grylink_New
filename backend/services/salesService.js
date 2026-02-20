const mongoose = require('mongoose');
const Company = require('../models/Company');
const SubContractor = require('../models/SubContractor');
const GryLink = require('../models/GryLink');
const { sendOnboardingLink } = require('./emailService');
const authService = require('./authService');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Build base query — admins/founders see all, sales agents see only theirs */
const agentFilter = (userId, role) => {
  if (role === 'admin' || role === 'founder') return {};
  return { salesAgentId: userId };
};

/** Compute SC profile-completion % based on filled fields */
const computeProfileCompletion = (sc) => {
  const checks = [
    !!sc.companyName,
    !!sc.contactName,
    !!sc.phone,
    !!sc.gstin,
    !!sc.pan,
    !!sc.constitutionType,
    !!(sc.registeredAddress?.city),
    !!(sc.bankDetails?.accountNumber),
    !!(sc.bankDetails?.ifscCode),
    !!(sc.kycDocuments?.panCard?.fileUrl),
    !!(sc.kycDocuments?.aadhaarCard?.fileUrl),
    !!(sc.kycDocuments?.gstCertificate?.fileUrl),
    !!(sc.kycDocuments?.cancelledCheque?.fileUrl),
    !!(sc.sellerDeclaration?.accepted),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

// ─── COMPANY LEADS ────────────────────────────────────────────────────────────

/** Step 3: Sales creates a company lead */
const createCompanyLead = async (data, salesAgentId) => {
  const { companyName, ownerName, email, phone, address, gstNumber, city, state, notes } = data;

  const existing = await Company.findOne({ email });
  if (existing) throw new Error('A company with this email already exists');

  const company = new Company({
    companyName,
    ownerName,
    email,
    phone,
    address,
    ...(gstNumber && { gstin: gstNumber.toUpperCase() }),
    ...(city && { city }),
    ...(state && { state }),
    salesAgentId,
    status: 'LEAD_CREATED',
    statusHistory: [{ status: 'LEAD_CREATED', changedBy: salesAgentId }],
  });

  // Save initial sales notes if provided
  if (notes && notes.trim()) {
    company.salesNotes.push({ text: notes.trim(), addedBy: salesAgentId });
  }
  await company.save();

  // Step 4: Generate GryLink + create EPC user
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
    linkType: 'company',
  });
  await gryLink.save();

  const link = `${process.env.GRYLINK_FRONTEND_URL}/onboarding/${gryLink.token}`;
  await sendOnboardingLink(email, ownerName, link);

  return { company, gryLink };
};

/** Get all leads with optional search + status filter */
const getLeads = async (userId, role, filters = {}) => {
  const query = agentFilter(userId, role);
  if (filters.status && filters.status !== 'ALL') query.status = filters.status;
  if (filters.search) {
    const rx = new RegExp(filters.search, 'i');
    query.$or = [{ companyName: rx }, { email: rx }, { phone: rx }, { ownerName: rx }];
  }
  const companies = await Company.find(query)
    .sort({ createdAt: -1 })
    .populate('salesAgentId', 'name email')
    .lean();

  if (!companies.length) return [];

  // Bulk-fetch latest GryLink for each company + SC counts
  const companyIds = companies.map((c) => c._id);
  const [gryLinks, scCounts] = await Promise.all([
    GryLink.find({ companyId: { $in: companyIds }, linkType: 'company' })
      .sort({ createdAt: -1 })
      .lean(),
    SubContractor.aggregate([
      { $match: { linkedEpcId: { $in: companyIds } } },
      { $group: { _id: '$linkedEpcId', count: { $sum: 1 } } },
    ]),
  ]);

  // Map: companyId → latest GryLink
  const linkMap = {};
  for (const gl of gryLinks) {
    const key = gl.companyId.toString();
    if (!linkMap[key]) linkMap[key] = gl; // already sorted desc
  }
  // Map: companyId → SC count
  const scCountMap = {};
  for (const row of scCounts) scCountMap[row._id.toString()] = row.count;

  return companies.map((c) => ({
    ...c,
    gryLink: linkMap[c._id.toString()] || null,
    scCount: scCountMap[c._id.toString()] || 0,
  }));
};

/** Get single company detail with GryLink + linked SCs count */
const getCompanyDetail = async (companyId, userId, role) => {
  const filter = agentFilter(userId, role);
  const company = await Company.findOne({ _id: companyId, ...filter })
    .populate('userId', 'name email phone')
    .populate('salesAgentId', 'name email')
    .populate('verifiedBy', 'name')
    .populate('salesNotes.addedBy', 'name')
    .populate('statusHistory.changedBy', 'name')
    .lean();
  if (!company) throw new Error('Company not found or access denied');

  // Attach latest GryLink
  const gryLink = await GryLink.findOne({ companyId, linkType: 'company' })
    .sort({ createdAt: -1 })
    .lean();

  // Count linked SCs
  const scCount = await SubContractor.countDocuments({ linkedEpcId: companyId });

  return { ...company, gryLink, scCount };
};

/** Get sub-contractors linked to a company */
const getSubContractorsForCompany = async (companyId) => {
  const scs = await SubContractor.find({ linkedEpcId: companyId })
    .sort({ createdAt: -1 })
    .lean();
  return scs.map((sc) => ({ ...sc, profileCompletion: computeProfileCompletion(sc) }));
};

/** Add internal sales note to a company */
const addCompanyNote = async (companyId, userId, note) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error('Company not found');
  if (!company.salesNotes) company.salesNotes = [];
  company.salesNotes.push({ text: note, addedBy: userId, addedAt: new Date() });
  await company.save();
  return company;
};

/** Resend GryLink for a company — expire old, create new */
const resendCompanyGryLink = async (companyId, salesAgentId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error('Company not found');

  // Expire all existing active links for this company
  await GryLink.updateMany(
    { companyId, status: 'active' },
    { status: 'expired' }
  );

  const gryLink = new GryLink({
    companyId,
    salesAgentId,
    email: company.email,
    linkType: 'company',
  });
  await gryLink.save();

  const link = `${process.env.GRYLINK_FRONTEND_URL}/onboarding/${gryLink.token}`;
  await sendOnboardingLink(company.email, company.ownerName, link);

  return { gryLink, message: 'GryLink resent successfully' };
};

// ─── SUB-CONTRACTORS ─────────────────────────────────────────────────────────

/** Get SC leads with optional search + status + kycStatus filter */
const getSubContractorLeads = async (userId, role, filters = {}) => {
  const query = agentFilter(userId, role);
  if (filters.status && filters.status !== 'ALL') query.status = filters.status;
  if (filters.kycStatus && filters.kycStatus !== 'ALL') query.kycStatus = filters.kycStatus;
  if (filters.search) {
    const rx = new RegExp(filters.search, 'i');
    query.$or = [{ companyName: rx }, { email: rx }, { contactName: rx }, { phone: rx }];
  }
  const scs = await SubContractor.find(query)
    .sort({ createdAt: -1 })
    .populate('linkedEpcId', 'companyName status')
    .populate('userId', 'name email')
    .populate('salesAgentId', 'name')
    .lean();

  return scs.map((sc) => ({ ...sc, profileCompletion: computeProfileCompletion(sc) }));
};

/** Get single SC detail */
const getSubContractorDetail = async (scId) => {
  const sc = await SubContractor.findById(scId)
    .populate('linkedEpcId', 'companyName status email')
    .populate('userId', 'name email')
    .populate('salesAgentId', 'name email')
    .populate('kycCompletedBy', 'name')
    .populate('contactLog.loggedBy', 'name')
    .populate('statusHistory.changedBy', 'name')
    .lean();
  if (!sc) throw new Error('Sub-contractor not found');
  return { ...sc, profileCompletion: computeProfileCompletion(sc) };
};

/** Mark SC as contacted (legacy) */
const markSubContractorContacted = async (subContractorId, salesAgentId, notes) => {
  const sc = await SubContractor.findById(subContractorId);
  if (!sc) throw new Error('Sub-contractor not found');

  sc.contactedAt = new Date();
  sc.contactedBy = salesAgentId;
  sc.contactNotes = notes || '';
  if (!sc.contactLog) sc.contactLog = [];
  sc.contactLog.push({
    method: 'CALL',
    outcome: 'CONTACTED',
    notes: notes || '',
    loggedBy: salesAgentId,
    loggedAt: new Date(),
  });
  sc.statusHistory.push({ status: 'CONTACTED', changedBy: salesAgentId, notes });
  await sc.save();
  return sc;
};

/** Add a contact log entry to an SC */
const addContactLog = async (scId, userId, { method, outcome, notes }) => {
  const sc = await SubContractor.findById(scId);
  if (!sc) throw new Error('Sub-contractor not found');
  if (!sc.contactLog) sc.contactLog = [];
  sc.contactLog.push({ method, outcome: outcome || '', notes: notes || '', loggedBy: userId, loggedAt: new Date() });
  // Mark contacted if first contact
  if (!sc.contactedAt) {
    sc.contactedAt = new Date();
    sc.contactedBy = userId;
  }
  await sc.save();
  await sc.populate('contactLog.loggedBy', 'name');
  return sc;
};

// ─── GRYLINKS ────────────────────────────────────────────────────────────────

/** Get all GryLinks for agent with optional filters */
const getGryLinks = async (userId, role, filters = {}) => {
  const query = role === 'admin' || role === 'founder' ? {} : { salesAgentId: userId };
  if (filters.status) query.status = filters.status;
  if (filters.linkType) query.linkType = filters.linkType;

  return GryLink.find(query)
    .sort({ createdAt: -1 })
    .populate('companyId', 'companyName ownerName email')
    .populate('subContractorId', 'companyName contactName email')
    .populate('salesAgentId', 'name')
    .lean();
};

/** Resend a specific GryLink — expire it, create a fresh one */
const resendGryLink = async (gryLinkId, salesAgentId) => {
  const original = await GryLink.findById(gryLinkId).populate('companyId').populate('subContractorId');
  if (!original) throw new Error('GryLink not found');

  // Expire the original
  original.status = 'expired';
  await original.save();

  const newLink = new GryLink({
    companyId: original.companyId?._id,
    subContractorId: original.subContractorId?._id,
    salesAgentId,
    email: original.email,
    linkType: original.linkType,
  });
  await newLink.save();

  const frontendUrl = `${process.env.GRYLINK_FRONTEND_URL}/onboarding/${newLink.token}`;
  const recipient = original.companyId || original.subContractorId;
  const name = recipient?.ownerName || recipient?.contactName || recipient?.companyName || 'User';
  await sendOnboardingLink(original.email, name, frontendUrl);

  return { gryLink: newLink, message: 'GryLink resent successfully' };
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

/** Rich dashboard stats: funnel, recent activity, month-over-month */
const getDashboardStats = async (userId, role) => {
  const filter = agentFilter(userId, role);

  // All companies + SCs
  const [allCompanies, allSCs, allGryLinks] = await Promise.all([
    Company.find(filter).sort({ createdAt: -1 }).lean(),
    SubContractor.find(filter).sort({ createdAt: -1 }).lean(),
    GryLink.find(
      role === 'admin' || role === 'founder' ? {} : { salesAgentId: userId }
    ).lean(),
  ]);

  // Funnel counts
  const funnelStages = ['LEAD_CREATED', 'CREDENTIALS_CREATED', 'DOCS_SUBMITTED', 'ACTION_REQUIRED', 'ACTIVE'];
  const companiesByStatus = {};
  funnelStages.forEach((s) => { companiesByStatus[s] = 0; });
  allCompanies.forEach((c) => {
    if (companiesByStatus[c.status] !== undefined) companiesByStatus[c.status]++;
    else companiesByStatus[c.status] = (companiesByStatus[c.status] || 0) + 1;
  });

  // GryLink stats
  const gryLinkStats = { active: 0, used: 0, expired: 0 };
  allGryLinks.forEach((gl) => { gryLinkStats[gl.status] = (gryLinkStats[gl.status] || 0) + 1; });

  // Expiring links (within 24 hours)
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiringSoon = allGryLinks.filter(
    (gl) => gl.status === 'active' && gl.expiresAt && new Date(gl.expiresAt) <= in24h
  );

  // SC KYC funnel
  const scByKyc = {};
  allSCs.forEach((sc) => { scByKyc[sc.kycStatus] = (scByKyc[sc.kycStatus] || 0) + 1; });

  // This month vs last month companies
  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthLeads = allCompanies.filter((c) => new Date(c.createdAt) >= startThisMonth).length;
  const lastMonthLeads = allCompanies.filter(
    (c) => new Date(c.createdAt) >= startLastMonth && new Date(c.createdAt) < startThisMonth
  ).length;

  // Action required: companies stuck in same status for 7+ days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stuckCompanies = allCompanies
    .filter((c) => ['LEAD_CREATED', 'CREDENTIALS_CREATED', 'DOCS_SUBMITTED'].includes(c.status))
    .filter((c) => {
      const lastChanged = c.statusHistory?.slice(-1)[0]?.changedAt || c.createdAt;
      return new Date(lastChanged) <= sevenDaysAgo;
    })
    .slice(0, 5);

  // Pending SC contacts
  const pendingContact = allSCs.filter((sc) => !sc.contactedAt).length;

  // Recent activity: last 10 companies + SCs created
  const recentCompanies = allCompanies.slice(0, 5).map((c) => ({
    type: 'company',
    id: c._id,
    name: c.companyName,
    status: c.status,
    createdAt: c.createdAt,
  }));
  const recentSCs = allSCs.slice(0, 5).map((sc) => ({
    type: 'subcontractor',
    id: sc._id,
    name: sc.companyName || sc.contactName || sc.email,
    status: sc.status,
    createdAt: sc.createdAt,
  }));
  const recentActivity = [...recentCompanies, ...recentSCs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return {
    totals: {
      companies: allCompanies.length,
      activeCompanies: companiesByStatus['ACTIVE'] || 0,
      subContractors: allSCs.length,
      pendingContact,
      activeGryLinks: gryLinkStats.active,
      expiringSoon: expiringSoon.length,
    },
    funnel: funnelStages.map((stage) => ({ stage, count: companiesByStatus[stage] || 0 })),
    companiesByStatus,
    scByKyc,
    gryLinkStats,
    monthOverMonth: { thisMonth: thisMonthLeads, lastMonth: lastMonthLeads },
    stuckCompanies,
    recentActivity,
    expiringSoon: expiringSoon.slice(0, 5),
  };
};

module.exports = {
  createCompanyLead,
  getLeads,
  getCompanyDetail,
  getSubContractorsForCompany,
  addCompanyNote,
  resendCompanyGryLink,
  getSubContractorLeads,
  getSubContractorDetail,
  markSubContractorContacted,
  addContactLog,
  getGryLinks,
  resendGryLink,
  getDashboardStats,
};
