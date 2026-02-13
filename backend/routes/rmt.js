const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const riskAssessmentService = require("../services/riskAssessmentService");
const cwcrfService = require("../services/cwcrfService");
const CwcRf = require("../models/CwcRf");
const Case = require("../models/Case");

/**
 * GET /api/rmt/dashboard - Get RMT dashboard summary
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("rmt", "admin", "founder"),
  async (req, res) => {
    try {
      // Get risk assessment stats
      const riskDashboard = await riskAssessmentService.getRiskDashboard();

      // Get CWCRF stats
      const cwcrfStats = await CwcRf.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const cwcrfByStatus = {};
      cwcrfStats.forEach((stat) => {
        cwcrfByStatus[stat._id] = stat.count;
      });

      // Get case stats for RMT
      const caseStats = await Case.aggregate([
        {
          $match: {
            currentStage: { $in: ["rmt_review", "risk_assessment"] },
          },
        },
        {
          $group: {
            _id: "$currentStage",
            count: { $sum: 1 },
          },
        },
      ]);

      const casesByStage = {};
      caseStats.forEach((stat) => {
        casesByStage[stat._id] = stat.count;
      });

      res.json({
        data: {
          riskAssessments: riskDashboard,
          cwcrfs: {
            inQueue:
              (cwcrfByStatus["BUYER_APPROVED"] || 0) +
              (cwcrfByStatus["UNDER_RISK_REVIEW"] || 0),
            cwcafReady: cwcrfByStatus["CWCAF_READY"] || 0,
            sharedWithNbfc: cwcrfByStatus["SHARED_WITH_NBFC"] || 0,
            total: Object.values(cwcrfByStatus).reduce((a, b) => a + b, 0),
          },
          cases: casesByStage,
        },
      });
    } catch (error) {
      console.error("RMT Dashboard error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/rmt/queue - Get items in RMT queue
 */
router.get(
  "/queue",
  authenticate,
  authorize("rmt", "admin", "founder"),
  async (req, res) => {
    try {
      const cwcrfs = await cwcrfService.getCwcRfsForRmt(req.query);
      res.json({ data: cwcrfs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/rmt/assessments - Get risk assessments
 */
router.get(
  "/assessments",
  authenticate,
  authorize("rmt", "admin", "founder"),
  async (req, res) => {
    try {
      const assessments = await riskAssessmentService.getPendingAssessments();
      res.json({ data: assessments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
