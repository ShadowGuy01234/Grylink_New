const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { uploadBills } = require("../middleware/upload");
const { uploadToCloudinary } = require("../services/cloudinaryService");
const TechPreneurRegistration = require("../models/TechPreneurRegistration");

/**
 * POST /api/techpreneur/register
 * Public — Submit a registration for TechPreneur Industrial Training 2026
 */
router.post("/register", uploadBills.single("screenshot"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      college,
      branch,
      year,
      trackPreference,
      transactionId,
      message,
      feeAmount,
      registrationPhase,
    } = req.body;
    
    const screenshot = req.file;

    // Basic presence validation
    if (!name || !email || !phone || !college || !branch || !year || !trackPreference || !transactionId || !screenshot) {
      return res.status(400).json({ error: "All required fields (including payment screenshot) must be provided." });
    }

    // Check for duplicate email
    const existing = await TechPreneurRegistration.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        error: "This email address is already registered. Contact us if you believe this is an error.",
      });
    }

    // Upload screenshot to Cloudinary
    const cloudResult = await uploadToCloudinary(screenshot.buffer, screenshot.mimetype, {
      folder: "gryork/techpreneur/screenshots",
    });

    const registration = new TechPreneurRegistration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      college: college.trim(),
      branch,
      year,
      trackPreference,
      transactionId: transactionId.trim(),
      message: message?.trim(),
      feeAmount: feeAmount || 999,
      registrationPhase: registrationPhase || "standard",
      screenshotUrl: cloudResult.secure_url,
    });

    await registration.save();

    console.log(`[TechPreneur] New registration: ${name} (${email}) — Track: ${trackPreference} — Phase: ${registrationPhase} — ₹${feeAmount}`);

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully! Our team will verify your payment and send confirmation within 24 hours.",
      registrationId: registration._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "This email address is already registered. Contact us if you believe this is an error.",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(". ") });
    }
    console.error("[TechPreneur] Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again or contact support." });
  }
});

/**
 * GET /api/techpreneur/registrations
 * Protected — View all registrations (admin/founder/ops/sales)
 */
router.get(
  "/registrations",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const {
        status,
        trackPreference,
        registrationPhase,
        paymentVerified,
        page = 1,
        limit = 50,
        search,
      } = req.query;

      const query = {};
      if (status) query.status = status;
      if (trackPreference) query.trackPreference = trackPreference;
      if (registrationPhase) query.registrationPhase = registrationPhase;
      if (paymentVerified !== undefined) query.paymentVerified = paymentVerified === "true";
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { college: { $regex: search, $options: "i" } },
          { transactionId: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const [items, total] = await Promise.all([
        TechPreneurRegistration.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        TechPreneurRegistration.countDocuments(query),
      ]);

      // Summary stats
      const stats = await TechPreneurRegistration.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$feeAmount", 0] } },
            earlyBird: { $sum: { $cond: [{ $eq: ["$registrationPhase", "early"] }, 1, 0] } },
            standard: { $sum: { $cond: [{ $eq: ["$registrationPhase", "standard"] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ["$registrationPhase", "late"] }, 1, 0] } },
            aiWeb: { $sum: { $cond: [{ $eq: ["$trackPreference", "AI + Web Development"] }, 1, 0] } },
            startup: { $sum: { $cond: [{ $eq: ["$trackPreference", "Startup & Entrepreneurship"] }, 1, 0] } },
            productivity: { $sum: { $cond: [{ $eq: ["$trackPreference", "Industry Productivity Tools"] }, 1, 0] } },
          },
        },
      ]);

      res.json({
        items,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
        stats: stats[0] || {},
      });
    } catch (error) {
      console.error("[TechPreneur] Fetch registrations error:", error);
      res.status(500).json({ error: "Unable to fetch registrations." });
    }
  }
);

/**
 * GET /api/techpreneur/registrations/:id
 * Protected — Get a single registration
 */
router.get(
  "/registrations/:id",
  authenticate,
  authorize("admin", "founder", "ops", "sales"),
  async (req, res) => {
    try {
      const item = await TechPreneurRegistration.findById(req.params.id).lean();
      if (!item) return res.status(404).json({ error: "Registration not found." });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch registration." });
    }
  }
);

/**
 * PATCH /api/techpreneur/registrations/:id
 * Protected — Update registration status, payment verification, SPOC assignment
 */
router.patch(
  "/registrations/:id",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const {
        status,
        paymentVerified,
        assignedSPOC,
        assignedGroup,
        notes,
      } = req.body;

      const update = {};
      if (status) update.status = status;
      if (paymentVerified !== undefined) {
        update.paymentVerified = paymentVerified;
        if (paymentVerified) {
          update.paymentVerifiedAt = new Date();
          update.paymentVerifiedBy = req.user?.name || req.user?.email || "system";
        }
      }
      if (assignedSPOC !== undefined) update.assignedSPOC = assignedSPOC;
      if (assignedGroup !== undefined) update.assignedGroup = assignedGroup;
      if (notes !== undefined) update.notes = notes;

      const item = await TechPreneurRegistration.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      );
      if (!item) return res.status(404).json({ error: "Registration not found." });

      console.log(`[TechPreneur] Registration ${req.params.id} updated by ${req.user?.email}`);
      res.json(item);
    } catch (error) {
      console.error("[TechPreneur] Update error:", error);
      res.status(500).json({ error: "Unable to update registration." });
    }
  }
);

/**
 * DELETE /api/techpreneur/registrations/:id
 * Protected — Delete a registration (admin/founder only)
 */
router.delete(
  "/registrations/:id",
  authenticate,
  authorize("admin", "founder"),
  async (req, res) => {
    try {
      const item = await TechPreneurRegistration.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ error: "Registration not found." });
      res.json({ message: "Registration deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Unable to delete registration." });
    }
  }
);

module.exports = router;
