const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadBills } = require("../middleware/upload");
const { uploadToCloudinary } = require("../services/cloudinaryService");
const TechPreneurRegistration = require("../models/TechPreneurRegistration");
const TechPreneurSettings = require("../models/TechPreneurSettings");
const { generateInvoicePDF } = require("../services/invoiceService");
const { sendTechPreneurConfirmation } = require("../services/emailService");

// Razorpay is instantiated per-request to ensure fresh env vars on Vercel serverless
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  // Accept both naming conventions
  const key_secret = process.env.RAZORPAY_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured in environment variables.");
  }
  return new Razorpay({ key_id, key_secret });
};

/**
 * GET /api/techpreneur/settings
 * Public — Returns registration open/closed status and maintenance message
 */
router.get("/settings", async (req, res) => {
  try {
    const settings = await TechPreneurSettings.getSettings();
    res.json({
      registrationOpen: settings.registrationOpen,
      maintenanceMessage: settings.maintenanceMessage,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/**
 * PATCH /api/techpreneur/settings
 * Protected — Admin toggles registration on/off or updates maintenance message
 */
router.patch(
  "/settings",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { registrationOpen, maintenanceMessage } = req.body;
      const settings = await TechPreneurSettings.getSettings();
      if (typeof registrationOpen === "boolean") settings.registrationOpen = registrationOpen;
      if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;
      await settings.save();
      console.log(`[TechPreneur] Settings updated by ${req.user?.email}: registrationOpen=${settings.registrationOpen}`);
      res.json({ success: true, registrationOpen: settings.registrationOpen, maintenanceMessage: settings.maintenanceMessage });
    } catch (err) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

/**
 * POST /api/techpreneur/pre-register
 * Public — Reserve a spot (pay later). Saves student info without payment.
 */
router.post("/pre-register", async (req, res) => {
  try {
    const { name, email, phone, college, branch, year, trackPreference } = req.body;
    if (!name || !email || !phone || !college || !branch || !year || !trackPreference) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const sanitizedPhone = phone.trim().replace(/^\+91/, "").replace(/\D/g, "");
    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({ error: "Enter a valid 10-digit phone number." });
    }
    // Prevent duplicates by email
    const existing = await TechPreneurRegistration.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const type = existing.paymentVerified ? "a confirmed registration" : "a reservation";
      return res.status(409).json({ error: `This email already has ${type}.` });
    }
    const registration = new TechPreneurRegistration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: sanitizedPhone,
      college: college.trim(),
      branch,
      year,
      trackPreference,
      feeAmount: 799,
      registrationPhase: "early",
      status: "pending_payment",
      paymentVerified: false,
    });
    await registration.save();
    console.log(`[TechPreneur] Pre-registration (Pay Later): ${name} (${email})`);
    res.status(201).json({
      success: true,
      message: "Spot reserved! Payment link will be sent shortly.",
      registrationId: registration._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "This email is already registered." });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(". ") });
    }
    console.error("[TechPreneur] Pre-register error:", err);
    res.status(500).json({ error: "Failed to save reservation. Please try again." });
  }
});

/**
 * POST /api/techpreneur/create-order
 * Initialize a Razorpay order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });
    if (amount * 100 < 100) return res.status(400).json({ error: "Amount must be at least ₹1" });

    const razorpay = getRazorpay();
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    // Return key_id so frontend never needs to hardcode or expose it via env
    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("[TechPreneur] Create order error:", error.message || error);
    res.status(500).json({ error: error.message || "Could not create Razorpay order" });
  }
});

/**
 * POST /api/techpreneur/register
 * Public — Submit a registration for TechPreneur Industrial Training 2026
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      college,
      branch,
      year,
      trackPreference,
      message,
      feeAmount,
      registrationPhase,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Basic presence validation
    if (!name || !email || !phone || !college || !branch || !year || !trackPreference || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "All required fields (including payment details) must be provided." });
    }

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_SECRET_KEY;
    if (!secret) throw new Error("Razorpay key secret is not configured.");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
    }

    // Check for duplicate email
    const existing = await TechPreneurRegistration.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        error: "This email address is already registered. Contact us if you believe this is an error.",
      });
    }

    // Sanitize phone — strip +91, spaces, dashes, parentheses
    const sanitizedPhone = phone.trim().replace(/^\+91/, "").replace(/\D/g, "");

    const registration = new TechPreneurRegistration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: sanitizedPhone,
      college: college.trim(),
      branch,
      year,
      trackPreference,
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      message: message?.trim(),
      feeAmount: feeAmount || 799,
      registrationPhase: registrationPhase || "early",
      status: "confirmed",
      paymentVerified: true,
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: "Razorpay",
    });

    await registration.save();

    console.log(`[TechPreneur] New registration (Razorpay): ${name} (${email}) — Track: ${trackPreference} — Phase: ${registrationPhase} — ₹${feeAmount}`);

    // Generate invoice PDF and send confirmation email (non-blocking)
    generateInvoicePDF(registration)
      .then((pdfBuffer) => sendTechPreneurConfirmation(registration, pdfBuffer))
      .catch((err) => console.error("[TechPreneur] Email/invoice error:", err.message));

    res.status(201).json({
      success: true,
      message: "Registration and payment successful!",
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

/**
 * POST /api/techpreneur/manual-register
 * Protected — Admin manually registers a student who already paid via Razorpay
 * Used to recover failed registrations where payment went through but DB save failed
 */
router.post(
  "/manual-register",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const {
        name, email, phone, college, branch, year,
        trackPreference, razorpayPaymentId, razorpayOrderId, feeAmount,
      } = req.body;

      if (!name || !email || !phone || !college || !branch || !year || !trackPreference || !razorpayPaymentId) {
        return res.status(400).json({ error: "All fields including Razorpay Payment ID are required." });
      }

      // Sanitize phone
      const sanitizedPhone = phone.trim().replace(/^\+91/, "").replace(/\D/g, "");

      // Check if already registered by email or payment ID
      const existing = await TechPreneurRegistration.findOne({
        $or: [
          { email: email.toLowerCase().trim() },
          { razorpayPaymentId: razorpayPaymentId.trim() },
        ],
      });
      if (existing) {
        return res.status(409).json({ error: "A registration with this email or Payment ID already exists." });
      }

      const registration = new TechPreneurRegistration({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: sanitizedPhone,
        college: college.trim(),
        branch,
        year,
        trackPreference,
        transactionId: razorpayPaymentId.trim(),
        razorpayOrderId: razorpayOrderId?.trim() || "",
        razorpayPaymentId: razorpayPaymentId.trim(),
        feeAmount: feeAmount || 799,
        registrationPhase: "early",
        status: "confirmed",
        paymentVerified: true,
        paymentVerifiedAt: new Date(),
        paymentVerifiedBy: req.user?.name || req.user?.email || "admin-manual",
      });

      await registration.save();

      console.log(`[TechPreneur] Manual registration by ${req.user?.email}: ${name} (${email}) — PayID: ${razorpayPaymentId}`);

      // Generate invoice PDF and send confirmation email (non-blocking)
      generateInvoicePDF(registration)
        .then((pdfBuffer) => sendTechPreneurConfirmation(registration, pdfBuffer))
        .catch((err) => console.error("[TechPreneur] Manual email/invoice error:", err.message));

      res.status(201).json({
        success: true,
        message: "Registration saved successfully.",
        registrationId: registration._id,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: "A registration with this email or Payment ID already exists." });
      }
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ error: messages.join(". ") });
      }
      console.error("[TechPreneur] Manual registration error:", error);
      res.status(500).json({ error: "Failed to save registration. Please try again." });
    }
  }
);

/**
 * GET /api/techpreneur/invoice/:id
 * Generate and stream a professional invoice PDF
 */
router.get("/invoice/:id", async (req, res) => {
  try {
    const reg = await TechPreneurRegistration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: "Registration not found" });

    const pdfBuffer = await generateInvoicePDF(reg);
    const filename = `Gryork-Invoice-${reg.razorpayPaymentId || reg.transactionId || reg._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    console.error("[TechPreneur] Invoice generation error", error);
    res.status(500).json({ error: "Unable to generate invoice" });
  }
});

module.exports = router;
