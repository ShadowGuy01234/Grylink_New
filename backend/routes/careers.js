const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const CareerApplication = require("../models/CareerApplication");

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// POST /api/careers/apply  –  Submit a job application (no auth required)
router.post("/apply", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      experience,
      currentCompany,
      linkedinUrl,
      portfolioUrl,
      coverLetter,
      resumeUrl,
    } = req.body;

    if (!name || !email || !phone || !role || !experience) {
      return res.status(400).json({
        error: "name, email, phone, role and experience are required.",
      });
    }

    const application = await CareerApplication.create({
      name,
      email,
      phone,
      role,
      department,
      experience,
      currentCompany,
      linkedinUrl,
      portfolioUrl,
      coverLetter,
      resumeUrl,
    });

    res.status(201).json({
      message: "Application submitted successfully! We'll be in touch.",
      id: application._id,
    });
  } catch (error) {
    console.error("Career apply error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ADMIN / FOUNDER ONLY ────────────────────────────────────────────────────

// GET /api/careers/applications  –  List all applications
router.get(
  "/applications",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const { status, role, search, page = 1, limit = 50 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (role) query.role = { $regex: role, $options: "i" };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [applications, total] = await Promise.all([
        CareerApplication.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate("reviewedBy", "name email"),
        CareerApplication.countDocuments(query),
      ]);

      res.json({ applications, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/careers/applications/stats  –  Count by status
router.get(
  "/applications/stats",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const stats = await CareerApplication.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const total = await CareerApplication.countDocuments();
      res.json({ stats, total });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/careers/applications/:id  –  Single application
router.get(
  "/applications/:id",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const app = await CareerApplication.findById(req.params.id).populate(
        "reviewedBy",
        "name email"
      );
      if (!app) return res.status(404).json({ error: "Application not found" });
      res.json(app);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PATCH /api/careers/applications/:id  –  Update status + admin notes
router.patch(
  "/applications/:id",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const { status, adminNotes } = req.body;
      const update = {};
      if (status) {
        update.status = status;
        update.reviewedBy = req.user._id;
        update.reviewedAt = new Date();
      }
      if (adminNotes !== undefined) update.adminNotes = adminNotes;

      const app = await CareerApplication.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true }
      ).populate("reviewedBy", "name email");

      if (!app) return res.status(404).json({ error: "Application not found" });
      res.json(app);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/careers/applications/:id  –  Hard delete
router.delete(
  "/applications/:id",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const app = await CareerApplication.findByIdAndDelete(req.params.id);
      if (!app) return res.status(404).json({ error: "Application not found" });
      res.json({ message: "Application deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
