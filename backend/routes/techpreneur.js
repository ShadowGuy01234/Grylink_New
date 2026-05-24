const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const PDFDocument = require("pdfkit");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadBills } = require("../middleware/upload");
const { uploadToCloudinary } = require("../services/cloudinaryService");
const TechPreneurRegistration = require("../models/TechPreneurRegistration");

// Razorpay is instantiated per-request to ensure fresh env vars on Vercel serverless
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured in environment variables.");
  }
  return new Razorpay({ key_id, key_secret });
};

/**
 * POST /api/techpreneur/create-order
 * Initialize a Razorpay order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const razorpay = getRazorpay();
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
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
    const secret = process.env.RAZORPAY_KEY_SECRET;
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

    const registration = new TechPreneurRegistration({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      college: college.trim(),
      branch,
      year,
      trackPreference,
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      message: message?.trim(),
      feeAmount: feeAmount || 999,
      registrationPhase: registrationPhase || "standard",
      status: "confirmed",
      paymentVerified: true,
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: "Razorpay",
    });

    await registration.save();

    console.log(`[TechPreneur] New registration (Razorpay): ${name} (${email}) — Track: ${trackPreference} — Phase: ${registrationPhase} — ₹${feeAmount}`);

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
 * GET /api/techpreneur/invoice/:id
 * Generate and download invoice PDF
 */
router.get("/invoice/:id", async (req, res) => {
  try {
    const reg = await TechPreneurRegistration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: "Registration not found" });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Gryork-Invoice-${reg.razorpayPaymentId || reg.transactionId || reg._id}.pdf"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('Gryork Consultants', { align: 'right' });
    doc.fontSize(10).text('TechPreneur Industrial Training', { align: 'right' });
    doc.moveDown(2);
    
    // Invoice Title
    doc.fontSize(25).text('PAYMENT INVOICE', { align: 'center' });
    doc.moveDown(2);

    // Bill To
    doc.fontSize(14).text('Bill To:');
    doc.fontSize(12)
       .text(`Name: ${reg.name}`)
       .text(`Email: ${reg.email}`)
       .text(`Phone: ${reg.phone}`)
       .text(`College: ${reg.college}`);
    doc.moveDown(2);

    // Payment Details
    doc.fontSize(14).text('Payment Details:');
    doc.fontSize(12)
       .text(`Date: ${new Date(reg.createdAt).toLocaleString()}`)
       .text(`Transaction ID: ${reg.razorpayPaymentId || reg.transactionId || "N/A"}`)
       .text(`Order ID: ${reg.razorpayOrderId || "N/A"}`)
       .text(`Status: ${reg.paymentVerified ? "PAID / VERIFIED" : "PENDING"}`);
    doc.moveDown(2);

    // Item Details
    doc.fontSize(14).text('Item Details:');
    doc.fontSize(12)
       .text(`Program: TechPreneur Industrial Training 2026`)
       .text(`Selected Track: ${reg.trackPreference}`)
       .text(`Amount Paid: Rs. ${reg.feeAmount}`);
    
    doc.moveDown(4);
    doc.fontSize(14).text('Thank you for your registration!', { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error("[TechPreneur] Invoice generation error", error);
    res.status(500).json({ error: "Unable to generate invoice" });
  }
});

module.exports = router;
