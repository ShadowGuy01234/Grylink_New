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

      const update = {};
      // Explicitly set boolean — avoids issues with falsy values not being persisted
      if (typeof registrationOpen === "boolean") update.registrationOpen = registrationOpen;
      if (maintenanceMessage !== undefined) update.maintenanceMessage = maintenanceMessage;

      const settings = await TechPreneurSettings.findOneAndUpdate(
        { key: "global" },
        { $set: update },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      console.log(`[TechPreneur] Settings updated by ${req.user?.email}: registrationOpen=${settings.registrationOpen}`);
      res.json({
        success: true,
        registrationOpen: settings.registrationOpen,
        maintenanceMessage: settings.maintenanceMessage,
      });
    } catch (err) {
      console.error("[TechPreneur] Settings update error:", err);
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
      feeAmount: 1769,
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
      feeAmount: feeAmount || 1769,
      registrationPhase: registrationPhase || "early",
      status: "confirmed",
      paymentVerified: true,
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: "Razorpay",
      usedReferralCode: req.body.usedReferralCode ? req.body.usedReferralCode.toUpperCase().trim() : undefined,
    });

    await registration.save();

    // Process used code (Promo or Referral)
    if (registration.usedReferralCode) {
      const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");
      const promo = await TechPreneurPromoCode.findOne({
        code: registration.usedReferralCode,
        isUsed: false
      });
      
      if (promo) {
        promo.isUsed = true;
        promo.usedByEmail = registration.email;
        promo.usedById = registration._id;
        promo.usedAt = new Date();
        await promo.save();
        console.log(`[TechPreneur] Promo code ${promo.code} marked as USED by ${registration.email}`);
      } else {
        // It's a referral code. Track the referral immediately for Razorpay checkouts
        const TechPreneurReferral = require("../models/TechPreneurReferral");
        const referrer = await TechPreneurRegistration.findOne({ referralCode: registration.usedReferralCode });
        if (referrer) {
          await TechPreneurReferral.findOneAndUpdate(
            { referrerId: referrer._id, referredEmail: registration.email },
            {
              $set: {
                referrerId: referrer._id,
                referrerEmail: referrer.email,
                referrerCode: registration.usedReferralCode,
                referredEmail: registration.email,
                referredId: registration._id,
                status: "verified",
                cashbackStatus: "eligible",
              },
            },
            { upsert: true, new: true }
          );
          console.log(`[TechPreneur] Referral tracked: ${registration.email} referred by ${referrer.email}`);
        }
      }
    }

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
        status, paymentVerified, assignedSPOC, assignedGroup, notes, dashboardAccess,
        name, email, phone, feeAmount, college, branch, year, trackPreference,
        razorpayPaymentId, razorpayOrderId, registrationPhase, usedReferralCode
      } = req.body;

      const update = {};
      if (status !== undefined) update.status = status;
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
      if (dashboardAccess !== undefined) update.dashboardAccess = dashboardAccess;
      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email.toLowerCase().trim();
      if (phone !== undefined) update.phone = phone.replace(/^\+91/, "").replace(/\D/g, "");
      if (feeAmount !== undefined) update.feeAmount = feeAmount;
      if (college !== undefined) update.college = college;
      if (branch !== undefined) update.branch = branch;
      if (year !== undefined) update.year = year;
      if (trackPreference !== undefined) update.trackPreference = trackPreference;
      if (razorpayPaymentId !== undefined) update.razorpayPaymentId = razorpayPaymentId;
      if (razorpayOrderId !== undefined) update.razorpayOrderId = razorpayOrderId;
      if (registrationPhase !== undefined) update.registrationPhase = registrationPhase;
      if (usedReferralCode !== undefined) {
        update.usedReferralCode = usedReferralCode ? usedReferralCode.toUpperCase().trim() : "";
      }

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
        trackPreference, razorpayPaymentId, razorpayOrderId, feeAmount, usedReferralCode
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
        feeAmount: feeAmount || 1769,
        registrationPhase: "early",
        status: "confirmed",
        paymentVerified: true,
        paymentVerifiedAt: new Date(),
        paymentVerifiedBy: req.user?.name || req.user?.email || "admin-manual",
        usedReferralCode: usedReferralCode ? usedReferralCode.toUpperCase().trim() : undefined,
      });

      await registration.save();

      // Process used code (Promo or Referral)
      if (registration.usedReferralCode) {
        const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");
        const promo = await TechPreneurPromoCode.findOne({ code: registration.usedReferralCode, isUsed: false });
        if (promo) {
          promo.isUsed = true;
          promo.usedByEmail = registration.email;
          promo.usedById = registration._id;
          promo.usedAt = new Date();
          await promo.save();
        } else {
          const TechPreneurReferral = require("../models/TechPreneurReferral");
          const referrer = await TechPreneurRegistration.findOne({ referralCode: registration.usedReferralCode });
          if (referrer) {
            await TechPreneurReferral.findOneAndUpdate(
              { referrerId: referrer._id, referredEmail: registration.email },
              {
                $set: {
                  referrerId: referrer._id,
                  referrerEmail: referrer.email,
                  referrerCode: registration.usedReferralCode,
                  referredEmail: registration.email,
                  referredId: registration._id,
                  status: "verified",
                  cashbackStatus: "eligible",
                },
              },
              { upsert: true, new: true }
            );
          }
        }
      }

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

// ─────────────────────────────────────────────────────────────────────
//  STUDENT AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const TechPreneurOTP = require("../models/TechPreneurOTP");
const createTransporter = require("../config/email");

const TP_JWT_SECRET = process.env.TP_JWT_SECRET || process.env.JWT_SECRET || "tp_secret_change_me";

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/techpreneur/auth/send-otp
 * Public — Send 6-digit OTP to a registered & payment-verified student email
 */
router.post("/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const student = await TechPreneurRegistration.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(404).json({ error: "No registration found with this email." });
    }

    if (!student.paymentVerified) {
      return res.status(403).json({
        error: "Your payment is not yet verified. Please contact support.",
      });
    }

    // Rate limit: delete old OTPs for this email and create a fresh one
    await TechPreneurOTP.deleteMany({ email: student.email });

    const otp = generateOTP();
    const otpRecord = new TechPreneurOTP({
      email: student.email,
      otpHash: hashOTP(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });
    await otpRecord.save();

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"TechPreneur 2026 | Gryork" <${process.env.SMTP_USER}>`,
      to: student.email,
      subject: "Your TechPreneur Dashboard Login OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
          <h2 style="color:#1a1a2e;margin-bottom:4px">TechPreneur Dashboard</h2>
          <p style="color:#6b7280;font-size:14px;margin-bottom:24px">Your one-time login code</p>
          <div style="background:#f0f4ff;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
            <p style="margin:0;font-size:12px;color:#6b7280;margin-bottom:8px">Your OTP</p>
            <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:8px;color:#2563eb">${otp}</p>
          </div>
          <p style="font-size:13px;color:#6b7280">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="font-size:13px;color:#6b7280">Hi <strong>${student.name}</strong>, welcome back to your TechPreneur learning portal.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="font-size:11px;color:#9ca3af;margin:0">Gryork Consultants Pvt Ltd · training.gryork.com</p>
        </div>
      `,
    });

    console.log(`[TechPreneur Auth] OTP sent to ${student.email}`);
    res.json({ success: true, message: "OTP sent to your registered email." });
  } catch (err) {
    console.error("[TechPreneur Auth] send-otp error:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

/**
 * POST /api/techpreneur/auth/verify-otp
 * Public — Verify OTP and return JWT token
 */
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required." });

    const otpRecord = await TechPreneurOTP.findOne({
      email: email.toLowerCase().trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    // Increment attempts
    otpRecord.attempts += 1;
    if (otpRecord.attempts > 5) {
      await TechPreneurOTP.deleteMany({ email: email.toLowerCase().trim() });
      return res.status(429).json({ error: "Too many attempts. Please request a new OTP." });
    }
    await otpRecord.save();

    if (otpRecord.otpHash !== hashOTP(otp)) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    const student = await TechPreneurRegistration.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.email,
        name: student.name,
        track: student.trackPreference,
      },
      TP_JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`[TechPreneur Auth] Login successful: ${student.email}`);
    res.json({
      success: true,
      token,
      student: {
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        year: student.year,
        track: student.trackPreference,
        referralCode: student.referralCode,
      },
    });
  } catch (err) {
    console.error("[TechPreneur Auth] verify-otp error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

/**
 * GET /api/techpreneur/auth/me
 * Protected (student JWT) — Return current student profile
 */
router.get("/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided." });

    let decoded;
    try {
      decoded = jwt.verify(token, TP_JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const student = await TechPreneurRegistration.findById(decoded.studentId).select(
      "name email phone college branch year trackPreference status paymentVerified dashboardAccess referralCode createdAt"
    );
    if (!student) return res.status(404).json({ error: "Student not found." });

    res.json({ student });
  } catch (err) {
    console.error("[TechPreneur Auth] me error:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// ─────────────────────────────────────────────────────────────────────
//  ADMIN: EDIT STUDENT REGISTRATION
// ─────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/techpreneur/registrations/:id/edit
 * Admin — Edit any field of a student registration
 */
router.patch(
  "/registrations/:id/edit",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const oldReg = await TechPreneurRegistration.findById(req.params.id);
      if (!oldReg) return res.status(404).json({ error: "Registration not found." });

      const allowedFields = [
        "name", "email", "phone", "college", "branch", "year", "trackPreference",
        "feeAmount", "razorpayPaymentId", "razorpayOrderId", "transactionId",
        "status", "paymentVerified", "dashboardAccess", "assignedSPOC",
        "assignedGroup", "notes", "registrationPhase", "usedReferralCode"
      ];

      const update = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          update[field] = req.body[field];
        }
      }

      if (update.paymentVerified === true && !update.status) {
        update.status = "confirmed";
      }

      // Auto-assign dashboard access when confirmed
      if (update.status === "confirmed") {
        update.dashboardAccess = true;
      }

      const reg = await TechPreneurRegistration.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!reg) return res.status(404).json({ error: "Registration not found." });

      // Auto-generate referral code when confirmed for the first time
      if ((update.status === "confirmed" || update.paymentVerified === true) && !reg.referralCode) {
        const TechPreneurReferral = require("../models/TechPreneurReferral");
        const namePrefix = reg.name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
        let code;
        let tries = 0;
        do {
          const suffix = require("crypto").randomBytes(3).toString("hex").toUpperCase();
          code = `${namePrefix}${suffix}`;
          const existing = await TechPreneurRegistration.findOne({ referralCode: code });
          if (!existing) break;
          tries++;
        } while (tries < 10);

        await TechPreneurRegistration.findByIdAndUpdate(reg._id, { $set: { referralCode: code } });
        reg.referralCode = code;

      }

      // If usedReferralCode was just added or changed, process it
      if (update.usedReferralCode && update.usedReferralCode !== oldReg.usedReferralCode) {
        const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");
        const promo = await TechPreneurPromoCode.findOne({
          code: update.usedReferralCode,
          isUsed: false
        });

        if (promo) {
          promo.isUsed = true;
          promo.usedByEmail = reg.email;
          promo.usedById = reg._id;
          promo.usedAt = new Date();
          await promo.save();
          console.log(`[TechPreneur] Manual Edit: Promo code ${promo.code} marked as USED by ${reg.email}`);
        } else {
          const TechPreneurReferral = require("../models/TechPreneurReferral");
          const referrer = await TechPreneurRegistration.findOne({ referralCode: update.usedReferralCode });
          if (referrer) {
            await TechPreneurReferral.findOneAndUpdate(
              { referrerId: referrer._id, referredEmail: reg.email },
              {
                $set: {
                  referrerId: referrer._id,
                  referrerEmail: referrer.email,
                  referrerCode: update.usedReferralCode,
                  referredEmail: reg.email,
                  referredId: reg._id,
                  status: "verified",
                  cashbackStatus: "eligible",
                },
              },
              { upsert: true, new: true }
            );
            console.log(`[TechPreneur] Manual Edit: Referral tracked for ${reg.email}`);
          }
        }
      }

      console.log(`[TechPreneur] Registration ${req.params.id} edited by ${req.user?.email}`);
      res.json({ success: true, registration: reg });
    } catch (err) {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: messages.join(". ") });
      }
      if (err.code === 11000) {
        return res.status(409).json({ error: "Email already exists for another registration." });
      }
      console.error("[TechPreneur] Edit registration error:", err);
      res.status(500).json({ error: "Failed to update registration." });
    }
  }
);

/**
 * POST /api/techpreneur/registrations/:id/send-welcome
 * Admin - Send the premium welcome email with referral code
 */
router.post(
  "/registrations/:id/send-welcome",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const student = await TechPreneurRegistration.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Registration not found." });

      // Generate referral code if not exists
      if (!student.referralCode) {
        const crypto = require("crypto");
        const prefix = student.name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
        let code;
        let isUnique = false;
        let tries = 0;
        while (!isUnique && tries < 20) {
          const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
          code = `${prefix}${suffix}`;
          const existing = await TechPreneurRegistration.findOne({ referralCode: code });
          if (!existing) isUnique = true;
          tries++;
        }
        student.referralCode = code;
        await student.save();
      }

      const createTransporter = require("../config/email");
      const transporter = createTransporter();
      const loginUrl = "https://training.gryork.com/login";

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TechPreneur 2026! 🚀</title>
</head>
<body style="background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 0; margin: 0; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Top Decorative Gradient Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 45px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Welcome to TechPreneur 2026! 🚀</h1>
      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px; font-weight: 500;">Your Journey to Master AI, Web Dev & Startup Begins Now</p>
    </div>
    
    <!-- Content Body -->
    <div style="padding: 40px 35px;">
      <div style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 20px;">Hey ${student.name},</div>
      
      <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
        We are absolutely thrilled to welcome you to the <strong>TechPreneur 2026 Program</strong>! Your payment has been verified, and your registration is officially confirmed. 
        <br/><br/>
        You are now part of an elite cohort of developers and aspiring founders. Over the next few weeks, you will master top industry skills, build real-world products, and receive exclusive mentorship.
      </div>
      
      <!-- Registration Details Card -->
      <div style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 15px; border-bottom: 1px solid #1f2937; padding-bottom: 8px;">Your Verified Details</div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500; width: 40%;">Track Preference</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600; width: 60%;">${student.trackPreference}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">College</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.college}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">Branch & Year</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.branch} (${student.year})</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">Registered Phone</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.phone}</td>
          </tr>
        </table>
      </div>
      
      <!-- Referral Program Card -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); border: 1px solid #4f46e5; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; color: #a78bfa; font-size: 18px; font-weight: 700;">✨ Earn While You Learn: Referral Rewards</h3>
        <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
          We want to reward you for bringing your friends on this journey. Share your unique referral code below:
        </p>
        
        <div style="background-color: #030712; border: 2px dashed #7c3aed; border-radius: 8px; padding: 12px 25px; display: inline-block; margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 24px; font-weight: 800; color: #10b981; letter-spacing: 2px;">${student.referralCode}</span>
        </div>
        
        <div style="text-align: left; background-color: rgba(3, 7, 18, 0.6); border-radius: 8px; padding: 15px; border: 1px solid #1f2937;">
          <div style="font-size: 13px; color: #e5e7eb; margin-bottom: 8px;">
            🎁 <strong>Your Peers Get:</strong> An immediate <strong>₹100 discount</strong> on registration when they use your code.
          </div>
          <div style="font-size: 13px; color: #e5e7eb; line-height: 1.5;">
            💸 <strong>You Get:</strong> A direct cashback reward of <strong>₹100</strong> for <em>every</em> successful registration.<br/>
            <span style="color: #34d399; font-weight: 600;">1 Referral = ₹100 | 2 Referrals = ₹200 | 10 Referrals = ₹1,000</span><br/>
            Whatever number of students you refer, you get that much × ₹100! Cashbacks will be credited directly to you. There are absolutely no limits! 🚀
          </div>
        </div>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 40px 0 20px 0;">
        <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 16px; font-weight: 700; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); text-align: center;">Access Student Dashboard</a>
      </div>
      
      <div style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 15px;">
        To log in, simply enter your registered email on the portal and verify via OTP.
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #070a13; padding: 30px; text-align: center; border-top: 1px solid #1f2937;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
        You received this email because your registration is verified for the TechPreneur 2026 Cohort.
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 12px;">
        &copy; 2026 Gryork Consultants Pvt Ltd. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        to: student.email,
        subject: "Official Welcome to TechPreneur 2026! 🚀 Your Dashboard & Referral Details inside",
        html: htmlContent,
        text: `Welcome to TechPreneur 2026, ${student.name}! Your registration is officially confirmed. Track: ${student.trackPreference}. Referral Code: ${student.referralCode}. Log in to your dashboard here: ${loginUrl}`
      });

      student.welcomeEmailSent = true;
      await student.save();

      res.json({ success: true, message: "Welcome email sent successfully!" });
    } catch (err) {
      console.error("[TechPreneur] Error sending welcome email:", err);
      res.status(500).json({ error: "Failed to send email." });
    }
  }
);

module.exports = router;

