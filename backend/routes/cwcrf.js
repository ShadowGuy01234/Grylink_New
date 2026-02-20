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
 * GET /api/cwcrf/ops/queue - Get CWCRFs awaiting Ops review
 * Phase 6 queue: SUBMITTED + OPS_REVIEW + RMT_APPROVED (triage)
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

/**
 * POST /api/cwcrf/:id/ops/verify-section - Ops verifies a CWCRF section (Phase 6.2)
 */
router.post(
  "/:id/ops/verify-section",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const { section, verified, notes } = req.body;
      if (!section) {
        return res.status(400).json({ error: "section is required (sectionA, sectionB, sectionC, sectionD, raBill, wcc, measurementSheet)" });
      }
      const cwcRf = await cwcrfService.opsVerifySection(
        req.params.id,
        req.user._id,
        { section, verified: !!verified, notes },
      );
      res.json({ message: `Section ${section} verification updated`, cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/ops/detach-field - Ops detaches a document/field (Phase 6.2 Super Access)
 */
router.post(
  "/:id/ops/detach-field",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const { section, field, reason } = req.body;
      if (!section || !field) {
        return res.status(400).json({ error: "section and field are required" });
      }
      const cwcRf = await cwcrfService.opsDetachField(
        req.params.id,
        req.user._id,
        { section, field, reason },
      );
      res.json({ message: `Field ${section}.${field} detached`, cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * PATCH /api/cwcrf/:id/ops/edit-field - Ops edits a field directly (Phase 6.2 Super Access)
 */
router.patch(
  "/:id/ops/edit-field",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const { section, field, newValue, reason } = req.body;
      if (!section || !field || newValue === undefined) {
        return res.status(400).json({ error: "section, field, and newValue are required" });
      }
      const cwcRf = await cwcrfService.opsEditField(
        req.params.id,
        req.user._id,
        { section, field, newValue, reason },
      );
      res.json({ message: `Field ${section}.${field} updated`, cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/ops/re-request - Ops sends re-request to SC (Phase 6.2 Super Access)
 */
router.post(
  "/:id/ops/re-request",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const { message, section } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "message is required" });
      }
      const result = await cwcrfService.opsReRequest(
        req.params.id,
        req.user._id,
        { message, section },
      );
      res.json({ message: "Re-request sent to sub-contractor", ...result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/ops/triage - Ops risk triage after RMT review (Phase 8)
 */
router.post(
  "/:id/ops/triage",
  authenticate,
  authorize("ops", "admin"),
  async (req, res) => {
    try {
      const { action, notes } = req.body;
      if (!action || !["forward_to_epc", "reject"].includes(action)) {
        return res.status(400).json({ error: "action must be 'forward_to_epc' or 'reject'" });
      }
      const cwcRf = await cwcrfService.opsTriage(
        req.params.id,
        req.user._id,
        { action, notes },
      );
      res.json({ message: action === "forward_to_epc" ? "Forwarded to EPC" : "CWCRF rejected", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// RMT ENDPOINTS
// ========================================

/**
 * GET /api/cwcrf/:id/pdf - Download full case as PDF (Phase 7.2)
 */
router.get(
  "/:id/pdf",
  authenticate,
  authorize("rmt", "ops", "admin", "founder"),
  async (req, res) => {
    try {
      const pdfDoc = await cwcrfService.generateCasePdf(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="CWCRF-${req.params.id}-Case-Report.pdf"`,
      );
      pdfDoc.pipe(res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

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
 * POST /api/cwcrf/:id/rmt/forward-to-ops - RMT forwards completed assessment to Ops (Phase 7.5)
 */
router.post(
  "/:id/rmt/forward-to-ops",
  authenticate,
  authorize("rmt", "admin"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.rmtForwardToOps(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({ message: "Forwarded to Ops for risk triage", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/rmt/generate-cwcaf - Generate CWCAF (Ops or RMT, Phase 10.1)
 */
router.post(
  "/:id/rmt/generate-cwcaf",
  authenticate,
  authorize("rmt", "ops", "admin"),
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
 * GET /api/cwcrf/:id/matching-nbfcs - Get eligible NBFCs for a CWCRF (Phase 10.2)
 */
router.get(
  "/:id/matching-nbfcs",
  authenticate,
  authorize("ops", "rmt", "admin"),
  async (req, res) => {
    try {
      const result = await cwcrfService.getMatchingNbfcs(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/share-with-nbfcs - Share CWCAF with matching NBFCs (Phase 10.3)
 */
router.post(
  "/:id/share-with-nbfcs",
  authenticate,
  authorize("ops", "rmt", "admin"),
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
// NBFC ACTIVE PROCESS QUEUE (must be before /:id)
// ========================================

/**
 * GET /api/cwcrf/nbfc/process - Get CWCRFs in NBFC active process
 */
router.get(
  "/nbfc/process",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      if (!req.user.nbfcId) {
        return res.status(400).json({ error: "No NBFC linked to this account" });
      }
      const cwcrfs = await cwcrfService.getCwcRfsInNbfcProcess(req.user.nbfcId);
      res.json(cwcrfs);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

// ========================================
// PLATFORM FEE PAYMENT (Phase 5.3)
// ========================================

/**
 * POST /api/cwcrf/:id/payment - Record platform fee payment
 */
router.post(
  "/:id/payment",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const { paymentReference, amount } = req.body;
      const cwcRf = await cwcrfService.recordPlatformFee(
        req.params.id,
        req.user._id,
        { paymentReference, amount },
      );
      res.json({ message: "Platform fee recorded", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ========================================
// NBFC POST-QUOTATION PROCESS (Phase 11.4)
// ========================================

/**
 * POST /api/cwcrf/:id/nbfc/start-due-diligence - NBFC starts DD
 */
router.post(
  "/:id/nbfc/start-due-diligence",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.nbfcStartDueDiligence(
        req.params.id,
        req.user._id,
      );
      res.json({ message: "Due diligence started", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/nbfc/complete-due-diligence - NBFC completes DD
 */
router.post(
  "/:id/nbfc/complete-due-diligence",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.nbfcCompleteDueDiligence(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({ message: "Due diligence completed", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/nbfc/issue-sanction - NBFC issues sanction letter
 */
router.post(
  "/:id/nbfc/issue-sanction",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.nbfcIssueSanctionLetter(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({ message: "Sanction letter issued", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/accept-sanction - SC accepts sanction letter
 */
router.post(
  "/:id/accept-sanction",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.scAcceptSanctionLetter(
        req.params.id,
        req.user._id,
      );
      res.json({ message: "Sanction letter accepted", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/nbfc/initiate-disbursement - NBFC initiates disbursement
 */
router.post(
  "/:id/nbfc/initiate-disbursement",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.nbfcInitiateDisbursement(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({ message: "Disbursement initiated", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * POST /api/cwcrf/:id/nbfc/confirm-disbursement - NBFC confirms disbursement
 */
router.post(
  "/:id/nbfc/confirm-disbursement",
  authenticate,
  authorize("nbfc"),
  async (req, res) => {
    try {
      const cwcRf = await cwcrfService.nbfcConfirmDisbursement(
        req.params.id,
        req.user._id,
        req.body,
      );
      res.json({ message: "Disbursement confirmed — funds sent", cwcRf });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
