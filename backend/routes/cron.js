/**
 * Cron Job Routes
 * Manual triggers for scheduled tasks (admin/testing use)
 */
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const cronJobs = require('../config/cronJobs');

/**
 * POST /api/cron/run/dormant
 * Manually trigger dormant marking job
 */
router.post('/run/dormant', auth(['admin', 'founder']), async (req, res) => {
  try {
    const result = await cronJobs.markDormantSubContractors();
    res.json({ success: true, message: 'Dormant marking job completed', ...result });
  } catch (error) {
    console.error('Manual dormant job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/run/sla-reminders
 * Manually trigger SLA reminder job
 */
router.post('/run/sla-reminders', auth(['admin', 'founder', 'ops']), async (req, res) => {
  try {
    const result = await cronJobs.checkSlaReminders();
    res.json({ success: true, message: 'SLA reminder job completed', ...result });
  } catch (error) {
    console.error('Manual SLA reminder job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/run/kyc-expiry
 * Manually trigger KYC expiry check job
 */
router.post('/run/kyc-expiry', auth(['admin', 'founder', 'ops']), async (req, res) => {
  try {
    const result = await cronJobs.checkKycExpiry();
    res.json({ success: true, message: 'KYC expiry check completed', ...result });
  } catch (error) {
    console.error('Manual KYC expiry job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/run/overdue-notifications
 * Manually trigger overdue notification job
 */
router.post('/run/overdue-notifications', auth(['admin', 'founder', 'ops']), async (req, res) => {
  try {
    const result = await cronJobs.checkOverdueNotifications();
    res.json({ success: true, message: 'Overdue notification job completed', ...result });
  } catch (error) {
    console.error('Manual overdue notification job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/run/actual-overdue
 * Manually trigger actual overdue check job
 */
router.post('/run/actual-overdue', auth(['admin', 'founder', 'ops']), async (req, res) => {
  try {
    const result = await cronJobs.checkActualOverdue();
    res.json({ success: true, message: 'Actual overdue check completed', ...result });
  } catch (error) {
    console.error('Manual actual overdue job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/run/all
 * Run all cron jobs manually
 */
router.post('/run/all', auth(['admin', 'founder']), async (req, res) => {
  try {
    const results = {};
    
    results.dormant = await cronJobs.markDormantSubContractors();
    results.slaReminders = await cronJobs.checkSlaReminders();
    results.kycExpiry = await cronJobs.checkKycExpiry();
    results.overdueNotifications = await cronJobs.checkOverdueNotifications();
    results.actualOverdue = await cronJobs.checkActualOverdue();
    
    res.json({ 
      success: true, 
      message: 'All cron jobs completed',
      results,
    });
  } catch (error) {
    console.error('Manual all jobs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cron/status
 * Get cron job status
 */
router.get('/status', auth(['admin', 'founder']), async (req, res) => {
  res.json({
    success: true,
    jobs: [
      { name: 'dormant', schedule: 'Daily at midnight IST', description: 'Mark inactive SCs as dormant (90 days)' },
      { name: 'sla-reminders', schedule: 'Every 6 hours', description: 'Send SLA milestone reminders' },
      { name: 'kyc-expiry', schedule: 'Weekly on Monday 9 AM IST', description: 'Check for expiring KYC' },
      { name: 'overdue-notifications', schedule: 'Daily at 10 AM IST', description: 'Send 1-month CWC due notifications' },
      { name: 'actual-overdue', schedule: 'Daily at 11 AM IST', description: 'Check and escalate overdue transactions' },
    ],
  });
});

module.exports = router;
