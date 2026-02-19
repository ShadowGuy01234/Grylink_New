const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const cwcrfService = require("../services/cwcrfService");

/**
 * CWCRF Routes - CWC Request Form API endpoints
 * Based on Gryork Platform Workflow Document
 */

// ========================================
// SELLER (Sub-Contractor) ENDPOINTS
// ========================================

/**
 * POST /api/cwcrf - Submit new CWCRF
 * Seller submits CWC Request Form after KYC completion
 */
router.post("/", authenticate, authorize("subcontractor"), async (req, res) => {
  try {
    if (!req.user.subContractorId) {
      return res
        .status(400)
        .json({ error: "No sub-contractor linked to this account" });
    }

    const cwcRf = await cwcrfService.submitCwcRf(
      req.user._id,
      req.user.subContractorId,
      req.body,
    );

    res.status(201).json({
      message: "CWCRF submitted successfully",
      cwcRf,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/cwcrf/my - Get seller's CWCRFs
 */
router.get(
  "/my",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      if (!req.user.subContractorId) {
        return res
          .status(400)
          .json({ error: "No sub-contractor linked to this account" });
      }

      const cwcrfs = await cwcrfService.getCwcRfsForSubContractor(
        req.user.subContractorId,
      );
      res.json(cwcrfs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/select-nbfc - Seller selects NBFC
 */
router.post(
  "/:id/select-nbfc",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const { nbfcId } = req.body;
      if (!nbfcId) {
        return res.status(400).json({ error: "nbfcId is required" });
      }

      const cwcRf = await cwcrfService.selectNbfc(
        req.params.id,
        req.user._id,
        nbfcId,
      );
      res.json({
        message: "NBFC selected successfully",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// BUYER (EPC) ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/buyer/pending - Get CWCRFs pending buyer verification
 */
router.get(
  "/buyer/pending",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      if (!req.user.companyId) {
        return res
          .status(400)
          .json({ error: "No company linked to this account" });
      }

      const cwcrfs = await cwcrfService.getPendingBuyerVerification(
        req.user.companyId,
      );
      res.json(cwcrfs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/buyer/verify - EPC verifies CWCRF with A, B, C inputs
 */
router.post(
  "/:id/buyer/verify",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.verifyByBuyer(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({
        message: "CWCRF verified successfully",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/buyer/reject - EPC rejects CWCRF
 */
router.post(
  "/:id/buyer/reject",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const cwcRf = await cwcrfService.rejectByBuyer(
        req.params.id,
        req.user._id,
        reason,
      );
      res.json({
        message: "CWCRF rejected",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// OPS ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/ops/queue - Get CWCRFs awaiting Ops review (BUYER_APPROVED)
 */
router.get(
  "/ops/queue",
  authenticate,
  authorize("ops", "admin", "founder"),
  async (req, res) => {
    try {
      const cwcrfs = await cwcrfService.getCwcRfsForOps(req.query);
      res.json({ cwcrfs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ========================================
// RMT ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/rmt/queue - Get CWCRFs in RMT queue
 */
router.get(
  "/rmt/queue",
  authenticate,
  authorize("rmt", "admin", "founder"),
  async (req, res) => {
    try {
      const cwcrfs = await cwcrfService.getCwcRfsForRmt(req.query);
      res.json(cwcrfs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/rmt/move-to-queue - Move CWCRF to RMT queue
 */
router.post(
  "/:id/rmt/move-to-queue",
  authenticate,
  authorize("ops", "rmt", "admin"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.moveToRmtQueue(
        req.params.id,
        req.user._id,
      );
      res.json({
        message: "CWCRF moved to RMT queue",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/rmt/generate-cwcaf - Generate CWCAF
 */
router.post(
  "/:id/rmt/generate-cwcaf",
  authenticate,
  authorize("rmt", "admin"),
  async (req, res) => {
    try {
      const result = await cwcrfService.generateCwcaf(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({
        message: "CWCAF generated successfully",
        ...result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/share-with-nbfcs - Share CWCAF with matching NBFCs
 */
router.post(
  "/:id/share-with-nbfcs",
  authenticate,
  authorize("rmt", "admin"),
  async (req, res) => {
    try {
      const result = await cwcrfService.shareWithNbfcs(
        req.params.id,
        req.user._id,
      );
      res.json({
        message: `CWCAF shared with ${result.matchingNbfcs} NBFCs`,
        cwcRf: result.cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// NBFC ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/nbfc/available - Get CWCAFs available to NBFC
 */
router.get(
  "/nbfc/available",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      if (!req.user.nbfcId) {
        return res
          .status(400)
          .json({ error: "No NBFC linked to this account" });
      }

      const cwcrfs = await cwcrfService.getCwcRfsForNbfc(req.user.nbfcId);
      res.json(cwcrfs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/nbfc/quote - NBFC submits quotation
 */
router.post(
  "/:id/nbfc/quote",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      if (!req.user.nbfcId) {
        return res
          .status(400)
          .json({ error: "No NBFC linked to this account" });
      }

      const cwcRf = await cwcrfService.submitNbfcQuotation(
        req.params.id,
        req.user.nbfcId,
        req.user._id,
        req.body,
      );

      res.json({
        message: "Quotation submitted successfully",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// COMMON ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/:id - Get CWCRF by ID
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const cwcRf = await cwcrfService.getCwcRfById(req.params.id);
    if (!cwcRf) {
      return res.status(404).json({ error: "CWCRF not found" });
    }

    // Check access rights based on user role
    const hasAccess =
      req.user.role === "admin" ||
      req.user.role === "founder" ||
      req.user.role === "ops" ||
      req.user.role === "rmt" ||
      (req.user.role === "subcontractor" &&
        cwcRf.subContractorId?._id?.toString() ===
          req.user.subContractorId?.toString()) ||
      (req.user.role === "epc" &&
        cwcRf.epcId?._id?.toString() === req.user.companyId?.toString()) ||
      (req.user.role === "nbfc" &&
        cwcRf.nbfcQuotations?.some(
          (q) => q.nbfcId?.toString() === req.user.nbfcId?.toString(),
        ));

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(cwcRf);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cwcrf/:id/move-to-nbfc-process - Final handoff to NBFC
 */
router.post(
  "/:id/move-to-nbfc-process",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.moveToNbfcProcess(
        req.params.id,
        req.user._id,
      );
      res.json({
        message: "CWCRF moved to NBFC process",
        cwcRf,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
