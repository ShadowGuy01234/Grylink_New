const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocuments, uploadExcel } = require('../middleware/upload');
const companyService = require('../services/companyService');

// POST /api/company/documents - Upload company documents (Step 5)
router.post(
  '/documents',
  authenticate,
  authorize('epc'),
  (req, res, next) => {
    uploadDocuments.array('documents', 10)(req, res, (err) => {
      if (err) {
        console.error('Multer upload error:', err);
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.user.companyId) {
        return res.status(400).json({ error: 'No company linked to this account' });
      }

      const documentTypes = req.body.documentTypes
        ? JSON.parse(req.body.documentTypes)
        : [];

      const docs = await companyService.uploadDocuments(
        req.user.companyId,
        req.files,
        documentTypes,
        req.user._id
      );
      res.status(201).json(docs);
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/company/profile - Get company profile with documents
router.get('/profile', authenticate, authorize('epc'), async (req, res) => {
  try {
    const profile = await companyService.getCompanyProfile(req.user.companyId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/company/subcontractors - Add sub-contractors manually (Step 7A)
router.post(
  '/subcontractors',
  authenticate,
  authorize('epc'),
  async (req, res) => {
    try {
      const { subContractors } = req.body;
      if (!subContractors || !Array.isArray(subContractors)) {
        return res.status(400).json({ error: 'subContractors array is required' });
      }

      const result = await companyService.addSubContractors(
        req.user.companyId,
        subContractors,
        req.user._id
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// POST /api/company/subcontractors/bulk - Bulk upload via Excel (Step 7B)
router.post(
  '/subcontractors/bulk',
  authenticate,
  authorize('epc'),
  uploadExcel.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Excel file is required' });
      }

      const result = await companyService.bulkAddSubContractors(
        req.user.companyId,
        req.file.buffer,
        req.user._id
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /api/company/subcontractors - Get all sub-contractors
router.get('/subcontractors', authenticate, authorize('epc'), async (req, res) => {
  try {
    const subContractors = await companyService.getSubContractors(req.user.companyId);
    res.json(subContractors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
