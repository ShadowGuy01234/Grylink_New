/**
 * TechPreneur Extended Routes
 * Sessions, Announcements, Projects, Referrals
 * Mounted at: /api/techpreneur-v2
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { authenticate, authorize } = require("../middleware/auth");
const TechPreneurRegistration = require("../models/TechPreneurRegistration");
const TechPreneurSession = require("../models/TechPreneurSession");
const TechPreneurAnnouncement = require("../models/TechPreneurAnnouncement");
const TechPreneurProject = require("../models/TechPreneurProject");
const TechPreneurReferral = require("../models/TechPreneurReferral");

const TP_JWT_SECRET = process.env.TP_JWT_SECRET || process.env.JWT_SECRET || "tp_secret_change_me";

// ─── Student JWT Middleware ────────────────────────────────────────────────────
function requireStudent(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Student authentication required." });
  try {
    req.student = jwt.verify(token, TP_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired student token." });
  }
}

// ─── Helper: Generate unique referral code ─────────────────────────────────────
function generateReferralCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}${suffix}`;
}

// =============================================================================
// SESSIONS
// =============================================================================

/**
 * GET /api/techpreneur-v2/sessions
 * Student (JWT) — Get all published sessions
 */
router.get("/sessions", requireStudent, async (req, res) => {
  try {
    const sessions = await TechPreneurSession.find({ isPublished: true })
      .sort({ sessionDate: 1, startTime: 1 })
      .lean();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

/**
 * GET /api/techpreneur-v2/sessions/all
 * Admin — Get ALL sessions (published and draft)
 */
router.get("/sessions/all", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const sessions = await TechPreneurSession.find().sort({ sessionDate: 1 }).lean();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

/**
 * POST /api/techpreneur-v2/sessions
 * Admin — Create a session
 */
router.post("/sessions", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const session = new TechPreneurSession(req.body);
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ error: "Failed to create session." });
  }
});

/**
 * PATCH /api/techpreneur-v2/sessions/:id
 * Admin — Update a session
 */
router.patch("/sessions/:id", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const session = await TechPreneurSession.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ error: "Session not found." });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to update session." });
  }
});

/**
 * DELETE /api/techpreneur-v2/sessions/:id
 * Admin — Delete a session
 */
router.delete("/sessions/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    await TechPreneurSession.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session." });
  }
});

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

/**
 * GET /api/techpreneur-v2/announcements
 * Student (JWT) — Get published announcements for their track
 */
router.get("/announcements", requireStudent, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const student = await TechPreneurRegistration.findById(studentId).select("trackPreference");
    const track = student?.trackPreference || "all";

    const announcements = await TechPreneurAnnouncement.find({
      isPublished: true,
      $or: [{ targetTrack: "all" }, { targetTrack: track }],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

/**
 * GET /api/techpreneur-v2/announcements/all
 * Admin — Get ALL announcements
 */
router.get("/announcements/all", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const announcements = await TechPreneurAnnouncement.find()
      .sort({ createdAt: -1 }).lean();
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

/**
 * POST /api/techpreneur-v2/announcements
 * Admin — Create announcement
 */
router.post("/announcements", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const ann = new TechPreneurAnnouncement({
      ...req.body,
      publishedBy: req.user?.email,
    });
    await ann.save();
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ error: "Failed to create announcement." });
  }
});

/**
 * PATCH /api/techpreneur-v2/announcements/:id
 * Admin — Update announcement
 */
router.patch("/announcements/:id", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const ann = await TechPreneurAnnouncement.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true }
    );
    if (!ann) return res.status(404).json({ error: "Announcement not found." });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement." });
  }
});

/**
 * DELETE /api/techpreneur-v2/announcements/:id
 * Admin — Delete announcement
 */
router.delete("/announcements/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    await TechPreneurAnnouncement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement." });
  }
});

// =============================================================================
// PROJECTS
// =============================================================================

/**
 * POST /api/techpreneur-v2/projects/submit
 * Student (JWT) — Submit a project
 */
router.post("/projects/submit", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    // Upsert — one submission per student
    const project = await TechPreneurProject.findOneAndUpdate(
      { studentId: student._id },
      {
        $set: {
          studentId: student._id,
          studentEmail: student.email,
          studentName: student.name,
          track: student.trackPreference,
          githubUrl: req.body.githubUrl || "",
          driveUrl: req.body.driveUrl || "",
          projectTitle: req.body.projectTitle || "",
          description: req.body.description || "",
          status: "submitted",
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, project });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ error: "Failed to submit project." });
  }
});

/**
 * GET /api/techpreneur-v2/projects/my
 * Student (JWT) — Get own project submission
 */
router.get("/projects/my", requireStudent, async (req, res) => {
  try {
    const project = await TechPreneurProject.findOne({ studentId: req.student.studentId });
    res.json({ project: project || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project." });
  }
});

/**
 * GET /api/techpreneur-v2/projects
 * Admin — Get all project submissions
 */
router.get("/projects", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { track, status, search } = req.query;
    const filter = {};
    if (track) filter.track = track;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { studentEmail: { $regex: search, $options: "i" } },
        { projectTitle: { $regex: search, $options: "i" } },
      ];
    }
    const projects = await TechPreneurProject.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ projects, total: projects.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

/**
 * PATCH /api/techpreneur-v2/projects/:id/review
 * Admin — Add feedback and update review status
 */
router.patch("/projects/:id/review", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { feedback, status } = req.body;
    const project = await TechPreneurProject.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          feedback,
          status: status || "reviewed",
          reviewedBy: req.user?.email,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project review." });
  }
});

// =============================================================================
// REFERRALS
// =============================================================================

/**
 * GET /api/techpreneur-v2/referrals/validate/:code
 * Public — Check if a referral code is valid (for checkout)
 */
router.get("/referrals/validate/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();

    // Check if it matches a Promo Code first
    const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");
    const promo = await TechPreneurPromoCode.findOne({ code });
    if (promo) {
      if (promo.isUsed) {
        return res.status(400).json({ valid: false, error: "This promo code has already been used." });
      }
      return res.json({ valid: true, referrerName: "Promo Code", discount: promo.discount });
    }

    // Fallback to Referral Code validation
    const referrer = await TechPreneurRegistration.findOne({
      referralCode: code,
      paymentVerified: true,
    }).select("name referralCode");
    if (!referrer) {
      return res.status(404).json({ valid: false, error: "Invalid or expired code." });
    }
    res.json({ valid: true, referrerName: referrer.name, discount: 200 });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate code." });
  }
});

/**
 * GET /api/techpreneur-v2/referrals/my-stats
 * Student (JWT) — Get own referral stats
 */
router.get("/referrals/my-stats", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId)
      .select("referralCode name");
    if (!student) return res.status(404).json({ error: "Student not found." });

    const referrals = await TechPreneurReferral.find({
      referrerId: student._id,
    }).lean();

    const total = referrals.length;
    const successful = referrals.filter(r => r.status === "verified" || r.status === "paid").length;
    const cashbackEarned = referrals.filter(r => r.cashbackStatus === "paid").reduce((s, r) => s + (r.cashbackAmount || 0), 0);
    const cashbackPending = successful >= 2 ? (referrals.filter(r => r.cashbackStatus === "eligible").length * 100) : 0;

    res.json({
      referralCode: student.referralCode,
      total,
      successful,
      cashbackEarned,
      cashbackPending,
      referrals,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch referral stats." });
  }
});

/**
 * GET /api/techpreneur-v2/referrals
 * Admin — Get all referral records
 */
router.get("/referrals", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const referrals = await TechPreneurReferral.find()
      .sort({ createdAt: -1 })
      .populate("referrerId", "name email")
      .populate("referredId", "name email paymentVerified")
      .lean();
    res.json({ referrals, total: referrals.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch referrals." });
  }
});

/**
 * PATCH /api/techpreneur-v2/referrals/:id/pay-cashback
 * Admin — Mark cashback as paid to referrer
 */
router.patch("/referrals/:id/pay-cashback", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    const referral = await TechPreneurReferral.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          cashbackStatus: "paid",
          cashbackAmount: 100,
          cashbackPaidAt: new Date(),
          cashbackPaidBy: req.user?.email,
        },
      },
      { new: true }
    );
    if (!referral) return res.status(404).json({ error: "Referral not found." });
    res.json({ success: true, referral });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cashback." });
  }
});

// =============================================================================
// REFERRAL CODE GENERATION (Internal helper — called when admin confirms payment)
// =============================================================================

/**
 * POST /api/techpreneur-v2/referrals/generate-code/:studentId
 * Admin — Generate and assign a referral code to a student
 */
router.post("/referrals/generate-code/:studentId", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });
    if (student.referralCode) {
      return res.json({ success: true, referralCode: student.referralCode, message: "Code already exists." });
    }
    let code;
    let tries = 0;
    do {
      code = generateReferralCode(student.name);
      const existing = await TechPreneurRegistration.findOne({ referralCode: code });
      if (!existing) break;
      tries++;
    } while (tries < 10);

    student.referralCode = code;
    await student.save();
    console.log(`[TechPreneur] Referral code ${code} assigned to ${student.email}`);
    res.json({ success: true, referralCode: code });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate referral code." });
  }
});

// =============================================================================
// ANALYTICS
// =============================================================================

/**
 * GET /api/techpreneur-v2/analytics
 * Admin — Platform-wide analytics snapshot
 */
router.get("/analytics", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      pendingStudents,
      totalRevenue,
      totalSessions,
      totalAnnouncements,
      totalProjects,
      submittedProjects,
      totalReferrals,
      paidReferrals,
      trackBreakdown,
    ] = await Promise.all([
      TechPreneurRegistration.countDocuments(),
      TechPreneurRegistration.countDocuments({ paymentVerified: true }),
      TechPreneurRegistration.countDocuments({ paymentVerified: false }),
      TechPreneurRegistration.aggregate([
        { $match: { paymentVerified: true } },
        { $group: { _id: null, total: { $sum: "$feeAmount" } } },
      ]),
      TechPreneurSession.countDocuments({ isPublished: true }),
      TechPreneurAnnouncement.countDocuments({ isPublished: true }),
      TechPreneurProject.countDocuments(),
      TechPreneurProject.countDocuments({ status: { $in: ["submitted", "reviewed", "approved"] } }),
      TechPreneurReferral.countDocuments(),
      TechPreneurReferral.countDocuments({ status: "verified" }),
      TechPreneurRegistration.aggregate([
        { $group: { _id: "$trackPreference", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      students: {
        total: totalStudents,
        verified: verifiedStudents,
        pending: pendingStudents,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
      },
      sessions: { total: totalSessions },
      announcements: { total: totalAnnouncements },
      projects: { total: totalProjects, submitted: submittedProjects },
      referrals: { total: totalReferrals, successful: paidReferrals },
      trackBreakdown: trackBreakdown.map(t => ({ track: t._id, count: t.count })),
    });
  } catch (err) {
    console.error("[TechPreneur] Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
});

// =============================================================================
// PROMO CODES (Admin Managed)
// =============================================================================

const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");

/**
 * GET /api/techpreneur-v2/promocodes
 * Admin — Get all promo codes
 */
router.get("/promocodes", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const promoCodes = await TechPreneurPromoCode.find().sort({ createdAt: -1 }).lean();
    res.json({ promoCodes, total: promoCodes.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch promo codes." });
  }
});

/**
 * POST /api/techpreneur-v2/promocodes
 * Admin — Generate a new promo code
 */
router.post("/promocodes", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { code, discount } = req.body;

    if (!discount || ![300, 500].includes(Number(discount))) {
      return res.status(400).json({ error: "Discount must be either 300 or 500." });
    }

    let finalCode = code?.toUpperCase().trim();

    if (!finalCode) {
      // Auto-generate a unique promo code
      let isUnique = false;
      let tries = 0;
      while (!isUnique && tries < 10) {
        const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
        finalCode = `SAVE${discount}${randomSuffix}`;
        const existing = await TechPreneurPromoCode.findOne({ code: finalCode });
        if (!existing) isUnique = true;
        tries++;
      }
    } else {
      // Check if custom code already exists
      const existing = await TechPreneurPromoCode.findOne({ code: finalCode });
      if (existing) {
        return res.status(409).json({ error: `Promo code '${finalCode}' already exists.` });
      }
    }

    const promo = new TechPreneurPromoCode({
      code: finalCode,
      discount: Number(discount),
      createdBy: req.user?.email || "admin",
    });

    await promo.save();
    res.status(201).json({ success: true, promoCode: promo });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    console.error("[TechPreneur] Promo code creation error:", err);
    res.status(500).json({ error: "Failed to create promo code." });
  }
});

/**
 * DELETE /api/techpreneur-v2/promocodes/:id
 * Admin — Delete a promo code
 */
router.delete("/promocodes/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    const promo = await TechPreneurPromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ error: "Promo code not found." });
    res.json({ success: true, message: "Promo code deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete promo code." });
  }
});

module.exports = router;
