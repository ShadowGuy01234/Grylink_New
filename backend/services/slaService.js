const Sla = require('../models/Sla');
const Case = require('../models/Case');
const SubContractor = require('../models/SubContractor');
const ApprovalRequest = require('../models/ApprovalRequest');

// Create SLA when case is initiated
const createSla = async (caseId, entityType = 'case') => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new Error('Case not found');

  // Set milestone dates from today
  const now = new Date();

  const sla = new Sla({
    case: caseId,
    entityType,
    milestones: {
      day3: {
        name: 'Initial Document Verification',
        targetDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      day7: {
        name: 'RMT Pre-screening Complete',
        targetDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      day10: {
        name: 'NBFC Approval Decision',
        targetDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      day14: {
        name: 'Deal Execution',
        targetDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
    },
    reminders: [],
    status: 'ACTIVE',
  });
  await sla.save();

  // Update case with SLA reference
  caseDoc.slaId = sla._id;
  await caseDoc.save();

  return sla;
};

// Complete a milestone
const completeMilestone = async (slaId, milestoneName, completedBy) => {
  const sla = await Sla.findById(slaId);
  if (!sla) throw new Error('SLA not found');

  const milestone = sla.milestones[milestoneName];
  if (!milestone) throw new Error('Milestone not found');

  milestone.status = new Date() <= milestone.targetDate ? 'COMPLETED' : 'COMPLETED_LATE';
  milestone.completedAt = new Date();
  milestone.completedBy = completedBy;

  // Check if all milestones are complete
  const allComplete = Object.values(sla.milestones).every(
    (m) => m.status === 'COMPLETED' || m.status === 'COMPLETED_LATE'
  );
  if (allComplete) {
    sla.status = 'COMPLETED';
  }

  await sla.save();
  return sla;
};

// Check and update overdue milestones
const checkMilestones = async () => {
  const activeSlas = await Sla.find({ status: 'ACTIVE' });
  const overdueList = [];

  for (const sla of activeSlas) {
    const now = new Date();
    let hasOverdue = false;

    for (const [key, milestone] of Object.entries(sla.milestones)) {
      if (milestone.status === 'PENDING' && now > milestone.targetDate) {
        sla.milestones[key].status = 'OVERDUE';
        hasOverdue = true;
        overdueList.push({
          slaId: sla._id,
          caseId: sla.case,
          milestone: key,
          targetDate: milestone.targetDate,
          daysOverdue: Math.floor((now - milestone.targetDate) / (1000 * 60 * 60 * 24)),
        });
      }
    }

    if (hasOverdue) {
      await sla.save();
    }
  }

  return overdueList;
};

// Send reminder for upcoming milestone
const sendReminder = async (slaId, milestoneName, reminderType) => {
  const sla = await Sla.findById(slaId);
  if (!sla) throw new Error('SLA not found');

  sla.reminders.push({
    milestone: milestoneName,
    sentAt: new Date(),
    type: reminderType,
    delivered: true,
  });
  await sla.save();

  return sla;
};

// Mark entity as dormant (no activity for 90 days)
const markDormant = async (entityType, entityId) => {
  if (entityType === 'subcontractor') {
    await SubContractor.findByIdAndUpdate(entityId, {
      status: 'DORMANT',
      'dormant.isDormant': true,
      'dormant.dormantSince': new Date(),
      $push: {
        statusHistory: {
          status: 'DORMANT',
          changedAt: new Date(),
          notes: 'No activity for 90 days',
        },
      },
    });
  }

  // Create escalation to Ops
  const approvalRequest = new ApprovalRequest({
    requestType: 'DORMANT_ESCALATION',
    title: `Dormant ${entityType}: ${entityId}`,
    description: 'Entity marked dormant due to 90 days of inactivity',
    entityType,
    entityId,
    priority: 'LOW',
  });
  await approvalRequest.save();

  return { success: true, entityType, entityId };
};

// Get SLA by case
const getSlaByCase = async (caseId) => {
  return await Sla.findOne({ case: caseId }).populate('case');
};

// Get all active SLAs
const getActiveSlas = async () => {
  return await Sla.find({ status: 'ACTIVE' })
    .populate('case', 'caseNumber seller buyer')
    .sort({ createdAt: -1 });
};

// Get overdue SLAs
const getOverdueSlas = async () => {
  const activeSlas = await Sla.find({ status: 'ACTIVE' }).populate('case');
  return activeSlas.filter((sla) =>
    Object.values(sla.milestones).some((m) => m.status === 'OVERDUE')
  );
};

// Get SLA dashboard data
const getSlaDashboard = async () => {
  const allSlas = await Sla.find({}).populate('case', 'caseNumber');

  const stats = {
    total: allSlas.length,
    active: allSlas.filter((s) => s.status === 'ACTIVE').length,
    completed: allSlas.filter((s) => s.status === 'COMPLETED').length,
    overdue: allSlas.filter((s) =>
      Object.values(s.milestones).some((m) => m.status === 'OVERDUE')
    ).length,
  };

  const recentOverdue = allSlas
    .filter((s) => Object.values(s.milestones).some((m) => m.status === 'OVERDUE'))
    .slice(0, 10);

  return { stats, recentOverdue };
};

module.exports = {
  createSla,
  completeMilestone,
  checkMilestones,
  sendReminder,
  markDormant,
  getSlaByCase,
  getActiveSlas,
  getOverdueSlas,
  getSlaDashboard,
};
