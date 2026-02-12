/**
 * Vercel Cron — KYC Expiry Check (weekly, Monday 9 AM IST)
 */
const { checkKycExpiry } = require('../../config/cronJobs');

module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await checkKycExpiry();
    res.json({ success: true, result });
  } catch (error) {
    console.error('[CRON] KYC expiry job error:', error);
    res.status(500).json({ error: error.message });
  }
};
