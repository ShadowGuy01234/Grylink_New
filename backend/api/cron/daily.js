/**
 * Vercel Cron — Daily Jobs (midnight IST)
 * - Mark dormant SubContractors
 * - Overdue notifications
 * - Actual overdue escalation
 */
const {
  markDormantSubContractors,
  checkOverdueNotifications,
  checkActualOverdue,
} = require('../../config/cronJobs');

module.exports = async (req, res) => {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = {
      dormant: await markDormantSubContractors(),
      overdueNotifications: await checkOverdueNotifications(),
      actualOverdue: await checkActualOverdue(),
    };
    res.json({ success: true, results });
  } catch (error) {
    console.error('[CRON] Daily job error:', error);
    res.status(500).json({ error: error.message });
  }
};
