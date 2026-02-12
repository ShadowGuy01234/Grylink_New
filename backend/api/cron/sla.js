/**
 * Vercel Cron — SLA Reminder Check (every 6 hours)
 */
const { checkSlaReminders } = require('../../config/cronJobs');

module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await checkSlaReminders();
    res.json({ success: true, result });
  } catch (error) {
    console.error('[CRON] SLA reminder job error:', error);
    res.status(500).json({ error: error.message });
  }
};
