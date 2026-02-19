const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { uploadDocuments, uploadExcel } = require("../middleware/upload");
const companyService = require("../services/companyService");

// POST /api/company/documents - Upload company documents (Step 5)
router.post(
  "/documents",
  authenticate,
  authorize("epc"),
  (req, res, next) => {
    uploadDocuments.array("documents", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res
          .status(400)
          .json({ error: "File upload error: " + err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.user.companyId) {
        return res
          .status(400)
          .json({ error: "No company linked to this account" });
      }

      const documentTypes = req.body.documentTypes
        ? JSON.parse(req.body.documentTypes)
        : [];

      const docs = await companyService.uploadDocuments(
        req.user.companyId,
        req.files,
        documentTypes,
        req.user._id,
      );
      res.status(201).json(docs);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/company/profile - Get company profile with documents
router.get("/profile", authenticate, authorize("epc"), async (req, res) => {
  try {
    const profile = await companyService.getCompanyProfile(req.user.companyId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/company/subcontractors - Add sub-contractors manually (Step 7A)
router.post(
  "/subcontractors",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const { subContractors } = req.body;
      if (!subContractors || !Array.isArray(subContractors)) {
        return res
          .status(400)
          .json({ error: "subContractors array is required" });
      }

      const result = await companyService.addSubContractors(
        req.user.companyId,
        subContractors,
        req.user._id,
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// POST /api/company/subcontractors/bulk - Bulk upload via Excel (Step 7B)
router.post(
  "/subcontractors/bulk",
  authenticate,
  authorize("epc"),
  uploadExcel.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Excel file is required" });
      }

      const result = await companyService.bulkAddSubContractors(
        req.user.companyId,
        req.file.buffer,
        req.user._id,
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/company/subcontractors - Get all sub-contractors
router.get(
  "/subcontractors",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const subContractors = await companyService.getSubContractors(
        req.user.companyId,
      );
      res.json(subContractors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/company/bills/pending-review - Bills awaiting EPC verification (OPS_APPROVED status)
router.get(
  "/bills/pending-review",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const Bill = require("../models/Bill");
      const bills = await Bill.find({
        linkedEpcId: req.user.companyId,
        status: "OPS_APPROVED",
      })
        .sort({ createdAt: -1 })
        .populate("subContractorId", "companyName contactName")
        .populate("linkedEpcId", "companyName");
      res.json({ bills });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/company/bills/:id/verify - EPC approves or rejects an OPS_APPROVED bill
router.post(
  "/bills/:id/verify",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const { decision, notes } = req.body;
      if (!decision || !["approve", "reject"].includes(decision)) {
        return res.status(400).json({ error: "Decision must be approve or reject" });
      }
      const verificationService = require("../services/verificationService");
      const bill = await verificationService.epcVerifyBill(
        req.params.id,
        decision,
        notes,
        req.user._id,
        req.user.companyId,
      );
      res.json({ bill });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// GET /api/company/active - Get all active EPC companies (for SC profile completion)
router.get("/active", authenticate, async (req, res) => {
  try {
    const Company = require("../models/Company");
    const companies = await Company.find({ status: "ACTIVE", role: "BUYER" })
      .select("companyName _id")
      .sort({ companyName: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/company/info/:id - Get basic company info by ID
router.get("/info/:id", authenticate, async (req, res) => {
  try {
    const Company = require("../models/Company");
    const company = await Company.findById(req.params.id).select(
      "companyName _id status",
    );
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/company/subcontractors/:id - Remove a sub-contractor
router.delete(
  "/subcontractors/:id",
  authenticate,
  authorize("epc"),
  async (req, res) => {
    try {
      const SubContractor = require("../models/SubContractor");
      const User = require("../models/User");

      const sc = await SubContractor.findById(req.params.id);
      if (!sc) {
        return res.status(404).json({ error: "Sub-contractor not found" });
      }

      // Verify the SC belongs to this EPC company
      if (sc.linkedEpcId?.toString() !== req.user.companyId?.toString()) {
        return res
          .status(403)
          .json({
            error: "You can only remove sub-contractors from your own company",
          });
      }

      // Check if SC has any active cases or bills
      const Bill = require("../models/Bill");
      const Case = require("../models/Case");

      const activeBills = await Bill.countDocuments({
        subContractorId: sc._id,
        status: { $nin: ["REJECTED", "PAID", "CANCELLED"] },
      });

      const activeCases = await Case.countDocuments({
        subContractorId: sc._id,
        status: { $nin: ["REJECTED", "COMPLETED", "CANCELLED"] },
      });

      if (activeBills > 0 || activeCases > 0) {
        return res.status(400).json({
          error: `Cannot remove sub-contractor with active bills (${activeBills}) or cases (${activeCases}). Please complete or cancel them first.`,
        });
      }

      // Delete the associated user if exists
      if (sc.userId) {
        await User.findByIdAndDelete(sc.userId);
      }

      // Delete the sub-contractor
      await SubContractor.findByIdAndDelete(sc._id);

      res.json({ message: "Sub-contractor removed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
