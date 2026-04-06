/**
 * Shared Scoring Engine for BDF & FPDF
 * Handles weighted scoring, conversion angle, classification, and pipeline assignment.
 */

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function getClassification(score) {
  if (score >= 75) return 'GREEN';
  if (score >= 50) return 'YELLOW';
  if (score >= 25) return 'ORANGE';
  return 'RED';
}

function getPipeline(classification) {
  const map = { GREEN: 'PRIORITY', YELLOW: 'STRATEGIC', ORANGE: 'HOLD', RED: 'ARCHIVE' };
  return map[classification] || 'ARCHIVE';
}

// ─── BDF SCORING ──────────────────────────────────────────────────────────────

function calculateBdfProjectFit(entry) {
  let score = 0;

  // Project value scoring
  const valueMap = { 'ABOVE_1500CR': 100, '500_1500CR': 80, '100_500CR': 60, 'BELOW_100CR': 30 };
  score += (valueMap[entry.projectValue] || 0) * 0.4;

  // Project stage scoring (earlier = better for financing)
  const stageMap = { '0_30': 100, '30_60': 50, 'ABOVE_60': 20 };
  score += (stageMap[entry.projectStage] || 0) * 0.3;

  // Company type
  score += (entry.companyType === 'EPC' ? 80 : 60) * 0.15;

  // Company size
  const sizeMap = { 'LARGE': 100, 'MID': 70, 'SMALL': 40 };
  score += (sizeMap[entry.companySize] || 0) * 0.15;

  return clamp(Math.round(score));
}

function calculateBdfGroundSignals(entry) {
  const convos = entry.groundIntelligence || [];
  if (convos.length === 0) return 0;

  let totalSignal = 0;
  const validConvos = convos.filter(c => c.billingFlow && c.subcontractorUsage && c.executionPressure && c.sentiment);

  if (validConvos.length === 0) return 0;

  for (const c of validConvos) {
    let convoScore = 0;

    // Billing delays = financing need signal
    const billingMap = { 'NOTICEABLE_DELAY': 100, 'SLIGHT_DELAY': 65, 'SMOOTH': 20 };
    convoScore += (billingMap[c.billingFlow] || 0) * 0.3;

    // High subcontractor usage = more potential
    const subMap = { 'HIGH': 100, 'MEDIUM': 60, 'LOW': 25 };
    convoScore += (subMap[c.subcontractorUsage] || 0) * 0.25;

    // Execution pressure = urgency
    const pressureMap = { 'HIGH': 100, 'MEDIUM': 60, 'LOW': 20 };
    convoScore += (pressureMap[c.executionPressure] || 0) * 0.25;

    // Sentiment (positive = engaging willingly)
    const sentimentMap = { 'POSITIVE': 80, 'NEUTRAL': 50, 'SLIGHTLY_NEGATIVE': 90 };
    convoScore += (sentimentMap[c.sentiment] || 0) * 0.2;

    totalSignal += convoScore;
  }

  // Average across conversations, bonus for more conversations
  let avgSignal = totalSignal / validConvos.length;
  if (validConvos.length >= 5) avgSignal *= 1.1;
  else if (validConvos.length >= 3) avgSignal *= 1.0;
  else avgSignal *= 0.7; // penalty for < 3

  return clamp(Math.round(avgSignal));
}

function calculateBdfAccessibility(entry) {
  let score = 0;
  if (entry.employeesIdentified) score += 30;
  if (entry.phoneNumberAvailable) score += 30;

  const reachMap = { 'EASY': 40, 'MODERATE': 25, 'DIFFICULT': 10 };
  score += reachMap[entry.reachability] || 0;

  // Bonus for digital presence
  if (entry.websiteAvailable) score += 5;
  if (entry.linkedinPresence) score += 5;

  return clamp(Math.round(score));
}

function calculateBdfEngagement(entry) {
  const convos = entry.groundIntelligence || [];
  let score = 0;

  // Number of conversations
  if (convos.length >= 5) score += 50;
  else if (convos.length >= 3) score += 35;
  else if (convos.length >= 1) score += 15;

  // Channel diversity
  const channels = new Set(convos.map(c => c.channel));
  score += Math.min(channels.size * 12, 30);

  // Company validation completeness
  if (entry.websiteAvailable) score += 8;
  if (entry.linkedinPresence) score += 12;

  return clamp(Math.round(score));
}

/**
 * Calculate full BDF scores
 * Weights: Project Fit 30%, Ground Signals 30%, Accessibility 20%, Engagement 20%
 */
function calculateBdfScore(entry) {
  const projectFit = calculateBdfProjectFit(entry);
  const groundSignals = calculateBdfGroundSignals(entry);
  const accessibility = calculateBdfAccessibility(entry);
  const engagement = calculateBdfEngagement(entry);

  let total = (projectFit * 0.30) + (groundSignals * 0.30) +
              (accessibility * 0.20) + (engagement * 0.20);

  // ⚠️ CRITICAL RULE: If project stage > 30%, cannot be Green (cap at 74)
  if (entry.projectStage !== '0_30') {
    total = Math.min(total, 74);
  }

  total = clamp(Math.round(total));
  const conversionAngle = Math.round((total / 100) * 180);
  const classification = getClassification(total);
  const pipeline = getPipeline(classification);

  return {
    scores: { projectFit, groundSignals, accessibility, engagement, totalScore: total, conversionAngle },
    classification,
    pipeline,
  };
}

// ─── FPDF SCORING ─────────────────────────────────────────────────────────────

function calculateFpdfLendingFit(entry) {
  let score = 0;

  // Number of matching segments
  const segments = entry.lendingSegments || [];
  if (segments.includes('VENDOR_FINANCING')) score += 40; // most aligned
  if (segments.includes('MSME_LENDING')) score += 25;
  if (segments.includes('INFRASTRUCTURE')) score += 15;

  // Products
  const products = entry.products || [];
  if (products.includes('INVOICE_FINANCING')) score += 15;
  if (products.includes('WORKING_CAPITAL')) score += 10;

  return clamp(Math.round(score));
}

function calculateFpdfTicketSize(entry) {
  const map = { 'HIGHER': 100, '10L_2CR': 70 };
  return map[entry.ticketSize] || 0;
}

function calculateFpdfEngagement(entry) {
  let score = 0;
  const o = entry.outreach || {};
  const e = entry.engagement || {};

  // Meeting status
  const meetingMap = { 'OFFLINE': 40, 'ONLINE': 30, 'NONE': 0 };
  score += meetingMap[e.meetingStatus] || 0;

  // Willingness
  const willMap = { 'OPEN': 35, 'MAYBE': 15, 'NOT_INTERESTED': 0 };
  score += willMap[e.willingness] || 0;

  // Conversation quality
  const qualityMap = { 'MEANINGFUL': 25, 'BASIC': 12, 'NONE': 0 };
  score += qualityMap[o.conversationQuality] || 0;

  return clamp(Math.round(score));
}

function calculateFpdfAccessibility(entry) {
  let score = 0;
  const o = entry.outreach || {};

  if (o.linkedinOutreach) score += 15;
  if (o.linkedinResponse) score += 25;
  if (o.callAttempted) score += 15;
  if (o.callConnected) score += 30;

  // Conversation quality adds accessibility signal
  if (o.conversationQuality === 'MEANINGFUL') score += 15;
  else if (o.conversationQuality === 'BASIC') score += 8;

  return clamp(Math.round(score));
}

function calculateFpdfGeography(entry) {
  const map = { 'PAN_INDIA': 100, 'NCR': 70, 'RESTRICTED': 30 };
  return map[entry.geography] || 0;
}

/**
 * Calculate full FPDF scores
 * Weights: Lending Fit 40%, Ticket Size 15%, Engagement 25%, Accessibility 10%, Geography 10%
 */
function calculateFpdfScore(entry) {
  const lendingFit = calculateFpdfLendingFit(entry);
  const ticketSizeScore = calculateFpdfTicketSize(entry);
  const engagementScore = calculateFpdfEngagement(entry);
  const accessibilityScore = calculateFpdfAccessibility(entry);
  const geographyScore = calculateFpdfGeography(entry);

  let total = (lendingFit * 0.40) + (ticketSizeScore * 0.15) +
              (engagementScore * 0.25) + (accessibilityScore * 0.10) +
              (geographyScore * 0.10);

  total = clamp(Math.round(total));
  const conversionAngle = Math.round((total / 100) * 180);
  const classification = getClassification(total);
  const pipeline = getPipeline(classification);

  return {
    scores: { lendingFit, ticketSizeScore, engagementScore, accessibilityScore, geographyScore, totalScore: total, conversionAngle },
    classification,
    pipeline,
  };
}

module.exports = {
  calculateBdfScore,
  calculateFpdfScore,
  getClassification,
  getPipeline,
};
