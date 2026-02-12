/**
 * Vercel Cron — Master Daily Job
 * Consolidates all scheduled tasks to fit within Vercel Hobby Plan limits (max 2 jobs).
 * Runs daily at midnight IST.
 */
const {
  markDormantSubContractors,
  checkOverdueNotifications,
  checkActualOverdue,
  checkSlaReminders,
  checkKycExpiry,
} = require('../../config/cronJobs');

module.exports = async (req, res) => {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = {
      // Daily tasks
      dormant: await markDormantSubContractors(),
      overdueNotifications: await checkOverdueNotifications(),
      actualOverdue: await checkActualOverdue(),
      
      // SLA Reminders (originally 6h, now daily for Hobby)
      slaReminders: await checkSlaReminders(),

      // KYC Expiry (originally weekly, now daily check is fine/better)
      kycExpiry: await checkKycExpiry(),
    };
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('[CRON] Master job error:', error);
    res.status(500).json({ error: error.message });
  }
};
