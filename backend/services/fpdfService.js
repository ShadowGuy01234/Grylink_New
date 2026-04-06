const FpdfEntry = require('../models/FpdfEntry');
const Nbfc = require('../models/Nbfc');
const User = require('../models/User');
const { calculateFpdfScore } = require('./scoringEngine');
const emailService = require('./emailService');

/**
 * Create a new FPDF entry (draft)
 */
async function createEntry(data, userId) {
  const entry = new FpdfEntry({
    ...data,
    createdBy: userId,
    status: 'DRAFT',
    statusHistory: [{ status: 'DRAFT', changedBy: userId, notes: 'Entry created' }],
  });
  await entry.save();
  return entry;
}

/**
 * Get all FPDF entries with optional filters
 */
async function getEntries(userId, userRole, filters = {}) {
  const query = {};

  if (!['admin', 'founder'].includes(userRole)) {
    query.createdBy = userId;
  }

  if (filters.pipeline) query.pipeline = filters.pipeline;
  if (filters.status) query.status = filters.status;
  if (filters.classification) query.classification = filters.classification;
  if (filters.search) {
    query.$or = [
      { companyName: { $regex: filters.search, $options: 'i' } },
      { location: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return FpdfEntry.find(query)
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });
}

/**
 * Get single FPDF entry by ID
 */
async function getEntryById(id) {
  const entry = await FpdfEntry.findById(id)
    .populate('createdBy', 'name email')
    .populate('convertedToNbfcId', 'name status');
  if (!entry) throw new Error('FPDF Entry not found');
  return entry;
}

/**
 * Update an FPDF entry (only DRAFT or IN_PROGRESS)
 */
async function updateEntry(id, data, userId) {
  const entry = await FpdfEntry.findById(id);
  if (!entry) throw new Error('FPDF Entry not found');
  if (!['DRAFT', 'IN_PROGRESS'].includes(entry.status)) {
    throw new Error('Only draft or in-progress entries can be edited');
  }

  // Update fields
  const allowed = [
    'companyName', 'companyType', 'location',
    'lendingSegments', 'products', 'ticketSize', 'geography',
  ];
  for (const field of allowed) {
    if (data[field] !== undefined) entry[field] = data[field];
  }

  // Update outreach
  if (data.outreach) {
    entry.outreach = { ...entry.outreach.toObject(), ...data.outreach };
  }

  // Update engagement
  if (data.engagement) {
    entry.engagement = { ...entry.engagement.toObject(), ...data.engagement };
  }

  if (entry.status === 'DRAFT') {
    entry.status = 'IN_PROGRESS';
    entry.statusHistory.push({ status: 'IN_PROGRESS', changedBy: userId, notes: 'Entry updated' });
  }

  // Recalculate scores
  const result = calculateFpdfScore(entry);
  entry.scores = result.scores;
  entry.classification = result.classification;
  entry.pipeline = result.pipeline;

  await entry.save();
  return entry;
}

/**
 * Submit an FPDF entry for review
 * Validates: ≥2 outreach attempts, ≥1 human interaction, all required fields
 */
async function submitEntry(id, userId) {
  const entry = await FpdfEntry.findById(id);
  if (!entry) throw new Error('FPDF Entry not found');
  if (entry.status === 'SUBMITTED') throw new Error('Entry already submitted');
  if (entry.status === 'CONVERTED') throw new Error('Entry already converted');

  const errors = [];
  const o = entry.outreach || {};
  const e = entry.engagement || {};

  // ≥2 outreach attempts
  const outreachAttempts = [o.linkedinOutreach, o.callAttempted].filter(Boolean).length;
  if (outreachAttempts < 2) {
    errors.push('Minimum 2 outreach attempts required (LinkedIn + Call)');
  }

  // ≥1 human interaction
  const hasHumanInteraction = o.callConnected || (e.meetingStatus && e.meetingStatus !== 'NONE');
  if (!hasHumanInteraction) {
    errors.push('At least 1 human interaction required (call connected or meeting conducted)');
  }

  // Required fields
  if (!entry.companyName || !entry.companyType || !entry.location) {
    errors.push('All Section A fields are required');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join('; ')}`);
  }

  // Final score
  const result = calculateFpdfScore(entry);
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
 * Convert GREEN/YELLOW FPDF entry to NBFC record
 */
async function convertToNbfc(id, userId, overrideData = {}) {
  const entry = await FpdfEntry.findById(id);
  if (!entry) throw new Error('FPDF Entry not found');
  if (entry.status === 'CONVERTED') throw new Error('Entry already converted');
  if (entry.status !== 'SUBMITTED') throw new Error('Entry must be submitted before conversion');

  if (!overrideData.email) throw new Error('Email is required for conversion');
  if (!overrideData.code) throw new Error('Short code is required for conversion');

  // Create NBFC
  const nbfc = new Nbfc({
    name: overrideData.name || entry.companyName,
    code: overrideData.code,
    email: overrideData.email,
    phone: overrideData.phone || '',
    address: entry.location === 'NCR' ? 'NCR Region' : '',
    status: 'ACTIVE',
    coverage: {
      geographies: entry.geography === 'PAN_INDIA' ? ['PAN_INDIA'] :
                   entry.geography === 'NCR' ? ['NCR'] : [],
    },
    statusHistory: [{ status: 'ACTIVE', changedBy: userId, notes: `Converted from FPDF Entry (Score: ${entry.scores.totalScore})` }],
  });
  await nbfc.save();

  // Create NBFC user
  const user = new User({
    name: overrideData.contactName || entry.companyName,
    email: overrideData.email,
    phone: overrideData.phone || '',
    role: 'nbfc',
    nbfcId: nbfc._id,
  });
  await user.save();

  nbfc.userId = user._id;
  await nbfc.save();

  // Update FPDF entry
  entry.status = 'CONVERTED';
  entry.convertedToNbfcId = nbfc._id;
  entry.convertedAt = new Date();
  entry.statusHistory.push({ status: 'CONVERTED', changedBy: userId, notes: `Converted to NBFC: ${nbfc.name}` });
  await entry.save();

  // Send invite email (non-blocking)
  try {
    await emailService.sendEmail(
      overrideData.email,
      'Welcome to Gryork — Partner Onboarding',
      `<p>Hi ${overrideData.contactName || entry.companyName},</p><p>Your NBFC account on Gryork has been created. You will receive your login credentials shortly.</p>`
    );
  } catch (emailErr) {
    console.error('Failed to send FPDF conversion email:', emailErr.message);
  }

  return { entry, nbfc };
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
    FpdfEntry.countDocuments(match),
    FpdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$pipeline', count: { $sum: 1 } } },
    ]),
    FpdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    FpdfEntry.aggregate([
      { $match: match },
      { $group: { _id: '$classification', count: { $sum: 1 } } },
    ]),
    FpdfEntry.find(match).sort({ updatedAt: -1 }).limit(5).populate('createdBy', 'name'),
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
  submitEntry,
  convertToNbfc,
  getDashboardStats,
};
