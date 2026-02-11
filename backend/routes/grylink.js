const express = require('express');
const router = express.Router();
const grylinkService = require('../services/grylinkService');

// GET /api/grylink/validate/:token - Validate a GryLink token
router.get('/validate/:token', async (req, res) => {
  try {
    const gryLink = await grylinkService.validateLink(req.params.token);
    res.json({
      valid: true,
      companyName: gryLink.companyId.companyName,
      ownerName: gryLink.companyId.ownerName,
      email: gryLink.email,
    });
  } catch (error) {
    res.status(400).json({ valid: false, error: error.message });
  }
});

// POST /api/grylink/set-password - Set password via GryLink (Step 4)
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await grylinkService.setPassword(token, password);
    res.json({
      message: 'Password set successfully',
      user: { id: result.user._id, name: result.user.name, email: result.user.email },
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
