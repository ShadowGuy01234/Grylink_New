const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const PublicFeedback = require("../models/PublicFeedback");
const PublicLead = require("../models/PublicLead");
const publicService = require("../services/publicService");

router.post("/feedback", async (req, res) => {
  try {
    await publicService.submitFeedback(req);
    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to submit feedback." });
  }
});

router.post("/lead", async (req, res) => {
  try {
    await publicService.submitLead(req);
    res.status(201).json({ message: "Lead submitted successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to submit lead." });
  }
});

router.post("/analytics/events", async (req, res) => {
  try {
    const processed = await publicService.trackEvents(req);
    res.status(202).json({ accepted: processed });
  } catch (error) {
    res.status(400).json({ error: error.message || "Unable to process analytics events." });
  }
});

router.get(
  "/insights",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const insights = await publicService.getPublicInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to load public insights." });
    }
  },
);

router.get(
  "/feedback",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const { status, type, page = 1, limit = 50 } = req.query;
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const [items, total] = await Promise.all([
        PublicFeedback.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        PublicFeedback.countDocuments(query),
      ]);

      res.json({
        items,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to fetch feedback." });
    }
  },
);

router.patch(
  "/feedback/:id/status",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const { status } = req.body || {};
      if (!["new", "in_review", "resolved", "closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid feedback status." });
      }

      const item = await PublicFeedback.findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true },
      );
      if (!item) return res.status(404).json({ error: "Feedback not found." });

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to update feedback." });
    }
  },
);

router.get(
  "/leads",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const { status, source, page = 1, limit = 50 } = req.query;
      const query = {};
      if (status) query.status = status;
      if (source) query.source = source;

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const [items, total] = await Promise.all([
        PublicLead.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        PublicLead.countDocuments(query),
      ]);

      res.json({
        items,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to fetch leads." });
    }
  },
);

module.exports = router;
