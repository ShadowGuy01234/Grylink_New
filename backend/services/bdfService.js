const BdfEntry = require('../models/BdfEntry');
const Company = require('../models/Company');
const User = require('../models/User');
const GryLink = require('../models/GryLink');
const { calculateBdfScore } = require('./scoringEngine');
const { v4: uuidv4 } = require('uuid');
const emailService = require('./emailService');

/**
 * Create a new BDF entry (draft)
 */
async function createEntry(data, userId) {
  const entry = new BdfEntry({
    ...data,
    createdBy: userId,
    status: 'DRAFT',
    statusHistory: [{ status: 'DRAFT', changedBy: userId, notes: 'Entry created' }],
  });
  await entry.save();
  return entry;
}

/**
 * Get all BDF entries with optional filters
 */
async function getEntries(userId, userRole, filters = {}) {
  const query = {};

  // Role-based scoping
  if (!['admin', 'founder'].includes(userRole)) {
    query.createdBy = userId;
  }

  if (filters.pipeline) query.pipeline = filters.pipeline;
  if (filters.status) query.status = filters.status;
  if (filters.classification) query.classification = filters.classification;
  if (filters.search) {
    query.$or = [
      { companyName: { $regex: filters.search, $options: 'i' } },
      { projectName: { $regex: filters.search, $options: 'i' } },
      { location: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return BdfEntry.find(query)
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });
}

/**
 * Get single BDF entry by ID
 */
async function getEntryById(id) {
  const entry = await BdfEntry.findById(id)
    .populate('createdBy', 'name email')
    .populate('convertedToCompanyId', 'companyName status');
  if (!entry) throw new Error('BDF Entry not found');
  return entry;
}

/**
 * Update a BDF entry (only DRAFT or IN_PROGRESS)
 */
async function updateEntry(id, data, userId) {
  const entry = await BdfEntry.findById(id);
  if (!entry) throw new Error('BDF Entry not found');
  if (!['DRAFT', 'IN_PROGRESS'].includes(entry.status)) {
    throw new Error('Only draft or in-progress entries can be edited');
  }

  // Update fields
  const allowed = [
    'companyName', 'companyType', 'projectName', 'location', 'projectType',
    'projectValue', 'projectStage', 'websiteAvailable', 'linkedinPresence',
    'companySize', 'employeesIdentified', 'phoneNumberAvailable', 'reachability',
  ];
  for (const field of allowed) {
    if (data[field] !== undefined) entry[field] = data[field];
  }

  // Update status to IN_PROGRESS if still DRAFT
  if (entry.status === 'DRAFT') {
    entry.status = 'IN_PROGRESS';
    entry.statusHistory.push({ status: 'IN_PROGRESS', changedBy: userId, notes: 'Entry updated' });
  }

  // Recalculate scores
  const result = calculateBdfScore(entry);
  entry.scores = result.scores;
  entry.classification = result.classification;
  entry.pipeline = result.pipeline;

  await entry.save();
  return entry;
}

/**
 * Add a ground intelligence conversation
 */
async function addGroundIntelligence(id, convoData, userId) {
  const entry = await BdfEntry.findById(id);
  if (!entry) throw new Error('BDF Entry not found');
  if (['SUBMITTED', 'CONVERTED'].includes(entry.status)) {
    throw new Error('Cannot add intelligence to submitted/converted entries');
  }

  entry.groundIntelligence.push(convoData);

  // Update status to IN_PROGRESS if still DRAFT
  if (entry.status === 'DRAFT') {
    entry.status = 'IN_PROGRESS';
    entry.statusHistory.push({ status: 'IN_PROGRESS', changedBy: userId, notes: 'Ground intelligence added' });
  }

  // Recalculate scores
  const result = calculateBdfScore(entry);
  entry.scores = result.scores;
  entry.classification = result.classification;
  entry.pipeline = result.pipeline;

  await entry.save();
  return entry;
}

/**
 * Remove a ground intelligence conversation
 */
async function removeGroundIntelligence(entryId, convoId, userId) {
  const entry = await BdfEntry.findById(entryId);
  if (!entry) throw new Error('BDF Entry not found');
  if (['SUBMITTED', 'CONVERTED'].includes(entry.status)) {
    throw new Error('Cannot modify submitted/converted entries');
  }

  entry.groundIntelligence.id(convoId).deleteOne();

  // Recalculate scores
  const result = calculateBdfScore(entry);
  entry.scores = result.scores;
  entry.classification = result.classification;
  entry.pipeline = result.pipeline;

  await entry.save();
  return entry;
}

/**
 * Submit a BDF entry for review
 * Validates: ≥3 conversations, all Section D signals filled, Section A complete, Accessibility filled
 */
async function submitEntry(id, userId) {
  const entry = await BdfEntry.findById(id);
  if (!entry) throw new Error('BDF Entry not found');
  if (entry.status === 'SUBMITTED') throw new Error('Entry already submitted');
  if (entry.status === 'CONVERTED') throw new Error('Entry already converted');

  // Validation
  const errors = [];

  // ≥3 conversations
  if (entry.groundIntelligence.length < 3) {
    errors.push('Minimum 3 ground intelligence conversations required');
  }

  // All Section D signals filled in each conversation
  const validConvos = entry.groundIntelligence.filter(
    c => c.billingFlow && c.subcontractorUsage && c.executionPressure && c.sentiment
  );
  if (validConvos.length < 3) {
    errors.push('All 5 question fields must be completed in at least 3 conversations');
  }

  // Section A complete
  if (!entry.companyName || !entry.companyType || !entry.projectName || !entry.location || !entry.projectValue || !entry.projectStage) {
    errors.push('All Section A (Project Qualification) fields are required');
  }

  // Section C complete
  if (entry.employeesIdentified === undefined || entry.phoneNumberAvailable === undefined || !entry.reachability) {
    errors.push('All Section C (Accessibility) fields are required');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join('; ')}`);
  }

  // Final score calculation
  const result = calculateBdfScore(entry);
  entry.scores = result.scores;
  entry.classification = result.classification;
  entry.pipeline = result.pipeline;

  entry.status = 'SUBMITTED';
  entry.submittedBy = userId;
  entry.submittedAt = new Date();
  entry.statusHistory.push({ status: 'SUBMITTED', changedBy: userId, notes: `Classified as ${result.classification} → ${result.pipeline}` });

  await entry.save();
  return entry;
}

/**
 * Convert a GREEN/YELLOW BDF entry into a Company lead + GryLink
 */
async function convertToLead(id, userId, overrideData = {}) {
  const entry = await BdfEntry.findById(id);
  if (!entry) throw new Error('BDF Entry not found');
  if (entry.status === 'CONVERTED') throw new Error('Entry already converted');
  if (entry.status !== 'SUBMITTED') throw new Error('Entry must be submitted before conversion');

  // Create Company
  const companyData = {
    companyName: overrideData.companyName || entry.companyName,
    ownerName: overrideData.ownerName || entry.companyName,
    email: overrideData.email,
    phone: overrideData.phone || '',
    address: entry.location,
    city: overrideData.city || '',
    state: overrideData.state || '',
    status: 'LEAD_CREATED',
    role: 'PENDING',
    salesAgentId: entry.createdBy,
    statusHistory: [{ status: 'LEAD_CREATED', changedBy: userId, notes: `Converted from BDF Entry (Score: ${entry.scores.totalScore})` }],
  };

  if (!companyData.email) throw new Error('Email is required for conversion');

  const company = new Company(companyData);
  await company.save();

  // Create EPC User (no password)
  const user = new User({
    name: companyData.ownerName,
    email: companyData.email,
    phone: companyData.phone,
    role: 'epc',
    companyId: company._id,
  });
  await user.save();

  company.userId = user._id;
  await company.save();

  // Create GryLink
  const token = uuidv4();
  const grylink = new GryLink({
    token,
    companyId: company._id,
    salesAgentId: entry.createdBy,
    email: companyData.email,
    linkType: 'company',
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await grylink.save();

  // Update BDF entry
  entry.status = 'CONVERTED';
  entry.convertedToCompanyId = company._id;
  entry.convertedAt = new Date();
  entry.statusHistory.push({ status: 'CONVERTED', changedBy: userId, notes: `Converted to Company: ${company.companyName}` });
  await entry.save();

  // Send onboarding email (non-blocking)
  try {
    const linkUrl = `${process.env.GRYLINK_FRONTEND_URL || 'https://link-gryork.vercel.app'}/onboarding/${token}`;
    await emailService.sendOnboardingLink(companyData.email, companyData.ownerName, linkUrl);
  } catch (emailErr) {
    console.error('Failed to send BDF conversion email:', emailErr.message);
  }

  return { entry, company, grylink };
}

/**
 * Get dashboard stats
 */
async function getDashboardStats(userId, userRole) {
  const match = {};
  if (!['admin', 'founder'].includes(userRole)) {
    match.createdBy = userId;
  }

  const [total, byPipeline, byStatus, byClassification, recentEntries] = await Promise.all([
    BdfEntry.countDocuments(match),
    BdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$pipeline', count: { $sum: 1 } } },
    ]),
    BdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    BdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$classification', count: { $sum: 1 } } },
    ]),
    BdfEntry.find(match).sort({ updatedAt: -1 }).limit(5).populate('createdBy', 'name'),
  ]);

  return {
    total,
    byPipeline: Object.fromEntries(byPipeline.map(p => [p._id, p.count])),
    byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
    byClassification: Object.fromEntries(byClassification.map(c => [c._id, c.count])),
    recentEntries,
  };
}

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  addGroundIntelligence,
  removeGroundIntelligence,
  submitEntry,
  convertToLead,
  getDashboardStats,
};
