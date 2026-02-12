/**
 * Cron Jobs Configuration
 * Handles scheduled tasks per SOP requirements
 * - SLA milestone reminders
 * - Dormant marking (90 days inactivity)
 * - KYC expiry checks
 * - Overdue notifications (CWC due date - 1 month)
 */
const cron = require('node-cron');
const mongoose = require('mongoose');
const SubContractor = require('../models/SubContractor');
const Company = require('../models/Company');
const Case = require('../models/Case');
const Transaction = require('../models/Transaction');
const Sla = require('../models/Sla');
const emailService = require('../services/emailService');
const reKycService = require('../services/reKycService');

// Track if cron jobs are initialized
let cronJobsInitialized = false;

/**
 * Mark inactive SubContractors as DORMANT
 * Per SOP: 90 days of inactivity
 */
const markDormantSubContractors = async () => {
  console.log('[CRON] Running dormant SubContractor check...');
  
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Find SubContractors who:
    // 1. Have not been active for 90+ days
    // 2. Are not already marked as DORMANT
    // 3. Have at least one completed transaction (to exclude new SCs)
    const inactiveSubContractors = await SubContractor.find({
      lastActivityDate: { $lte: ninetyDaysAgo },
      status: { $ne: 'DORMANT' },
      isDormant: { $ne: true },
    });

    let markedCount = 0;
    for (const sc of inactiveSubContractors) {
      // Verify there are no recent transactions
      const recentTx = await Transaction.findOne({
        seller: sc._id,
        createdAt: { $gte: ninetyDaysAgo },
      });

      if (!recentTx) {
        sc.isDormant = true;
        sc.dormantMarkedAt = new Date();
        sc.status = 'DORMANT';
        await sc.save();
        markedCount++;

        console.log(`[CRON] Marked SubContractor ${sc._id} as DORMANT`);
      }
    }

    console.log(`[CRON] Dormant check complete. Marked ${markedCount} SubContractors.`);
    return { marked: markedCount };
  } catch (error) {
    console.error('[CRON] Dormant marking error:', error);
    throw error;
  }
};

/**
 * Check for SLA milestone reminders
 * Send notifications for upcoming milestones
 */
const checkSlaReminders = async () => {
  console.log('[CRON] Running SLA reminder check...');
  
  try {
    // Find SLAs with milestones due in next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const slas = await Sla.find({
      status: 'ACTIVE',
    }).populate('caseId');

    let remindersSent = 0;

    for (const sla of slas) {
      const upcomingMilestones = sla.milestones.filter(m => 
        !m.completed && 
        m.targetDate && 
        new Date(m.targetDate) <= threeDaysFromNow &&
        new Date(m.targetDate) >= new Date()
      );

      for (const milestone of upcomingMilestones) {
        // Check if notification already sent
        const existingNotification = sla.notifications.find(n =>
          n.milestoneIndex === sla.milestones.indexOf(milestone) &&
          n.type === 'REMINDER'
        );

        if (!existingNotification) {
          // Send reminder
          try {
            await emailService.sendSlaReminder(sla, milestone);
            
            sla.notifications.push({
              type: 'REMINDER',
              milestoneIndex: sla.milestones.indexOf(milestone),
              sentAt: new Date(),
            });
            
            remindersSent++;
          } catch (err) {
            console.error('[CRON] Failed to send SLA reminder:', err);
          }
        }
      }

      if (sla.isModified()) {
        await sla.save();
      }
    }

    console.log(`[CRON] SLA reminder check complete. Sent ${remindersSent} reminders.`);
    return { remindersSent };
  } catch (error) {
    console.error('[CRON] SLA reminder error:', error);
    throw error;
  }
};

/**
 * Check for KYC expiring soon
 * Per SOP Section 8
 */
const checkKycExpiry = async () => {
  console.log('[CRON] Running KYC expiry check...');
  
  try {
    // Check EPC KYC expiring in 30 days
    const expiring = await reKycService.checkExpiringKyc(30);

    for (const company of expiring) {
      // Trigger renewal reminder
      try {
        await emailService.sendKycExpiryReminder(company);
      } catch (err) {
        console.error('[CRON] Failed to send KYC expiry reminder:', err);
      }
    }

    console.log(`[CRON] KYC expiry check complete. ${expiring.length} companies expiring soon.`);
    return { expiringCount: expiring.length };
  } catch (error) {
    console.error('[CRON] KYC expiry check error:', error);
    throw error;
  }
};

/**
 * Check for CWC overdue notifications
 * Per SOP Section 13: Notify 1 month before CWC due date
 */
const checkOverdueNotifications = async () => {
  console.log('[CRON] Running overdue notification check...');
  
  try {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Find transactions with CWC due date approaching
    const approachingDue = await Transaction.find({
      status: 'DISBURSED',
      cwcDueDate: {
        $gte: new Date(),
        $lte: oneMonthFromNow,
      },
      'overdueNotification.sent': { $ne: true },
    })
    .populate('caseId')
    .populate('seller')
    .populate('buyer');

    let notificationsSent = 0;

    for (const tx of approachingDue) {
      try {
        // Send notification to all relevant parties
        await emailService.sendOverdueUpcomingNotification(tx);

        tx.overdueNotification = {
          sent: true,
          sentAt: new Date(),
          dueDate: tx.cwcDueDate,
        };
        await tx.save();

        notificationsSent++;
      } catch (err) {
        console.error('[CRON] Failed to send overdue notification:', err);
      }
    }

    console.log(`[CRON] Overdue notification check complete. Sent ${notificationsSent} notifications.`);
    return { notificationsSent };
  } catch (error) {
    console.error('[CRON] Overdue notification error:', error);
    throw error;
  }
};

/**
 * Check for actual overdue transactions and escalate
 * Per SOP Section 10: Recourse Framework
 */
const checkActualOverdue = async () => {
  console.log('[CRON] Running actual overdue check...');
  
  try {
    const now = new Date();

    // Find transactions past CWC due date
    const overdue = await Transaction.find({
      status: 'DISBURSED',
      cwcDueDate: { $lt: now },
      overdueStatus: { $ne: 'ESCALATED' },
    })
    .populate('caseId')
    .populate('seller')
    .populate('buyer');

    let escalated = 0;

    for (const tx of overdue) {
      const daysPastDue = Math.floor((now - new Date(tx.cwcDueDate)) / (1000 * 60 * 60 * 24));

      // Set overdue status based on days past due
      if (daysPastDue >= 30 && tx.overdueStatus !== 'CRITICAL') {
        tx.overdueStatus = 'CRITICAL';
        tx.recourseFramework = {
          activated: true,
          activatedAt: new Date(),
          daysPastDue,
        };

        // Notify founders for critical overdue
        try {
          await emailService.sendCriticalOverdueAlert(tx);
        } catch (err) {
          console.error('[CRON] Failed to send critical overdue alert:', err);
        }

        escalated++;
      } else if (daysPastDue >= 7 && !tx.overdueStatus) {
        tx.overdueStatus = 'OVERDUE';
        
        // Notify ops team
        try {
          await emailService.sendOverdueAlert(tx);
        } catch (err) {
          console.error('[CRON] Failed to send overdue alert:', err);
        }

        escalated++;
      }

      if (tx.isModified()) {
        await tx.save();
      }
    }

    console.log(`[CRON] Actual overdue check complete. Escalated ${escalated} transactions.`);
    return { escalated };
  } catch (error) {
    console.error('[CRON] Actual overdue check error:', error);
    throw error;
  }
};

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
  if (cronJobsInitialized) {
    console.log('[CRON] Cron jobs already initialized');
    return;
  }

  console.log('[CRON] Initializing cron jobs...');

  // Mark dormant SubContractors - Daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await markDormantSubContractors();
    } catch (error) {
      console.error('[CRON] Dormant job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // SLA reminder check - Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await checkSlaReminders();
    } catch (error) {
      console.error('[CRON] SLA reminder job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // KYC expiry check - Weekly on Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    try {
      await checkKycExpiry();
    } catch (error) {
      console.error('[CRON] KYC expiry job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Overdue notification check - Daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      await checkOverdueNotifications();
    } catch (error) {
      console.error('[CRON] Overdue notification job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Actual overdue check - Daily at 11 AM
  cron.schedule('0 11 * * *', async () => {
    try {
      await checkActualOverdue();
    } catch (error) {
      console.error('[CRON] Actual overdue job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  cronJobsInitialized = true;
  console.log('[CRON] All cron jobs initialized successfully');
};

/**
 * Manual trigger functions for testing
 */
const runManually = {
  dormant: markDormantSubContractors,
  slaReminders: checkSlaReminders,
  kycExpiry: checkKycExpiry,
  overdueNotifications: checkOverdueNotifications,
  actualOverdue: checkActualOverdue,
};

module.exports = {
  initializeCronJobs,
  runManually,
  markDormantSubContractors,
  checkSlaReminders,
  checkKycExpiry,
  checkOverdueNotifications,
  checkActualOverdue,
};
