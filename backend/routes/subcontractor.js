const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { uploadBills } = require("../middleware/upload");
const subContractorService = require("../services/subContractorService");

// GET /api/subcontractor/profile - Get sub-contractor profile and data
router.get(
  "/profile",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const data = await subContractorService.getDashboard(req.user._id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PUT /api/subcontractor/profile - Complete profile (Step 10)
router.put(
  "/profile",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const result = await subContractorService.completeProfile(
        req.user._id,
        req.body,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/bills - Upload bills (Step 11)
router.post(
  "/bills",
  authenticate,
  authorize("subcontractor"),
  uploadBills.array("bills", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one bill file is required" });
      }

      const bills = await subContractorService.uploadBill(
        req.user._id,
        req.files,
        req.body,
      );
      res.status(201).json(bills);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/bills - Get all bills for subcontractor
router.get(
  "/bills",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const bills = await subContractorService.getBills(req.user._id);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Alias for compatibility with frontend using /bill instead of /bills
router.post(
  "/bill",
  authenticate,
  authorize("subcontractor"),
  uploadBills.array("bills", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one bill file is required" });
      }

      const bills = await subContractorService.uploadBill(
        req.user._id,
        req.files,
        req.body,
      );
      res.status(201).json(bills);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/cases - Get all cases for subcontractor
router.get(
  "/cases",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const cases = await subContractorService.getCases(req.user._id);
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/cwc - Submit CWC RF (Step 13)
router.post(
  "/cwc",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const cwcRf = await subContractorService.submitCwcRf(
        req.user._id,
        req.body,
      );
      res.status(201).json(cwcRf);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/bids/:id/respond - Respond to bid (Step 18)
router.post(
  "/bids/:id/respond",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const { decision, counterOffer } = req.body;
      if (!decision || !["accept", "reject", "negotiate"].includes(decision)) {
        return res
          .status(400)
          .json({ error: "Decision must be accept, reject, or negotiate" });
      }

      const result = await subContractorService.respondToBid(
        req.user._id,
        req.params.id,
        decision,
        counterOffer,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/dashboard - Get dashboard data
router.get(
  "/dashboard",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const data = await subContractorService.getDashboard(req.user._id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/profile - Get profile (alias for dashboard)
router.get(
  "/profile",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const data = await subContractorService.getDashboard(req.user._id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/bids - Get incoming bids (Step 18)
router.get(
  "/bids",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const bids = await subContractorService.getIncomingBids(req.user._id);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/cases - Get cases
router.get(
  "/cases",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const cases = await subContractorService.getCases(req.user._id);
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/bill - Upload bill (single file)
router.post(
  "/bill",
  authenticate,
  authorize("subcontractor"),
  uploadBills.array("bills", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one bill file is required" });
      }
      const bills = await subContractorService.uploadBill(
        req.user._id,
        req.files,
        req.body,
      );
      res.status(201).json(bills);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/bills/:id/wcc - Upload WCC (SOP Phase 6)
router.post(
  "/bills/:id/wcc",
  authenticate,
  authorize("subcontractor"),
  uploadBills.single("wcc"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "WCC file is required" });
      }
      const result = await subContractorService.uploadWcc(
        req.user._id,
        req.params.id,
        req.file,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/bills/:id/measurement-sheet - Upload Measurement Sheet (SOP Phase 6)
router.post(
  "/bills/:id/measurement-sheet",
  authenticate,
  authorize("subcontractor"),
  uploadBills.single("measurementSheet"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Measurement sheet file is required" });
      }
      const result = await subContractorService.uploadMeasurementSheet(
        req.user._id,
        req.params.id,
        req.file,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ==================== SELLER DECLARATION ROUTES ====================

// POST /api/subcontractor/declaration/accept - Accept seller declaration (Step 4 - Hard Gate)
router.post(
  "/declaration/accept",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const result = await subContractorService.acceptDeclaration(req.user._id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/declaration/status - Get declaration status
router.get(
  "/declaration/status",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const result = await subContractorService.getDeclarationStatus(
        req.user._id,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ==================== KYC DOCUMENT ROUTES ====================
// Note: Specific routes (/kyc/upload, /kyc/status) must come BEFORE dynamic route (/kyc/:documentType)

// POST /api/subcontractor/kyc/upload - Upload KYC document (legacy with documentType in body)
router.post(
  "/kyc/upload",
  authenticate,
  authorize("subcontractor"),
  uploadBills.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Document file is required" });
      }
      const { documentType } = req.body;
      if (!documentType) {
        return res.status(400).json({ error: "Document type is required" });
      }
      const result = await subContractorService.uploadKycDocument(
        req.user._id,
        documentType,
        req.file,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/subcontractor/kyc/status - Get KYC status
router.get(
  "/kyc/status",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const result = await subContractorService.getKycStatus(req.user._id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/subcontractor/kyc/:documentType - Upload KYC document (dynamic route for frontend)
router.post(
  "/kyc/:documentType",
  authenticate,
  authorize("subcontractor"),
  uploadBills.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Document file is required" });
      }
      const { documentType } = req.params;
      const validTypes = ["panCard", "aadhaarCard", "gstCertificate", "cancelledCheque", "incorporationCertificate", "bankStatement"];
      if (!validTypes.includes(documentType)) {
        return res.status(400).json({ error: `Invalid document type. Valid types: ${validTypes.join(", ")}` });
      }
      const result = await subContractorService.uploadKycDocument(
        req.user._id,
        documentType,
        req.file,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// PUT /api/subcontractor/bank-details - Update bank details
router.put(
  "/bank-details",
  authenticate,
  authorize("subcontractor"),
  async (req, res) => {
    try {
      const result = await subContractorService.updateBankDetails(
        req.user._id,
        req.body,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

module.exports = router;
