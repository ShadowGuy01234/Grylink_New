const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const caseService = require("../services/caseService");

// GET /api/cases/rmt/pending - Get cases pending RMT risk assessment
// NOTE: This must be before /:id to avoid 'rmt' being matched as an id
router.get(
  "/rmt/pending",
  authenticate,
  authorize("rmt", "admin"),
  async (req, res) => {
    try {
      const cases = await caseService.getCases({ status: "EPC_VERIFIED" });
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/cases - Get all cases with optional filters
router.get("/", authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    // Scope cases based on role
    if (req.user.role === "epc") {
      filters.epcId = req.user.companyId;
    }

    const cases = await caseService.getCases(filters);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cases/:id - Get single case
router.get("/:id", authenticate, async (req, res) => {
  try {
    const caseDoc = await caseService.getCaseById(req.params.id);
    res.json(caseDoc);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/cases/:id/review - EPC reviews a case (Step 16)
router.post("/:id/review", authenticate, authorize("epc"), async (req, res) => {
  try {
    const { decision, notes } = req.body;
    if (!decision || !["approve", "reject"].includes(decision)) {
      return res
        .status(400)
        .json({ error: "Decision must be approve or reject" });
    }

    const caseDoc = await caseService.epcReviewCase(
      req.params.id,
      decision,
      notes,
      req.user._id,
    );
    res.json(caseDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/cases/:id/risk-assessment - RMT risk assessment
router.post(
  "/:id/risk-assessment",
  authenticate,
  authorize("rmt", "admin"),
  async (req, res) => {
    try {
      const { riskScore, riskLevel, assessment, recommendation, notes } =
        req.body;
      if (!riskScore || !riskLevel || !recommendation) {
        return res.status(400).json({
          error: "riskScore, riskLevel, and recommendation are required",
        });
      }
      if (!["low", "medium", "high", "critical"].includes(riskLevel)) {
        return res
          .status(400)
          .json({ error: "riskLevel must be low, medium, high, or critical" });
      }
      if (!["approve", "reject", "needs_review"].includes(recommendation)) {
        return res.status(400).json({
          error: "recommendation must be approve, reject, or needs_review",
        });
      }

      const caseDoc = await caseService.rmtRiskAssessment(
        req.params.id,
        { riskScore, riskLevel, assessment, recommendation, notes },
        req.user._id,
      );
      res.json(caseDoc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
