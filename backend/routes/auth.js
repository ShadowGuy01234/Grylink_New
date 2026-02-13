const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

// POST /api/auth/register - Register internal users (sales, ops, rmt, admin)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }

    const allowedRoles = ["sales", "ops", "rmt", "admin"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ error: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    const result = await authService.register({
      name,
      email,
      password,
      phone,
      role,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login - Login for all users
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// GET /api/auth/me - Get current user
router.get("/me", async (req, res) => {
  try {
    const { authenticate } = require("../middleware/auth");
    // This is handled inline for simplicity since it's a single route
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /api/auth/register-subcontractor - Sub-contractor self-registration (Step 9)
router.post("/register-subcontractor", async (req, res) => {
  try {
    const { name, email, password, phone, companyName } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const result = await authService.registerSubcontractor({
      name,
      email,
      password,
      phone,
      companyName,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/auth/check-email/:email - Check if email is a valid SC lead
router.get("/check-email/:email", async (req, res) => {
  try {
    const SubContractor = require("../models/SubContractor");
    const User = require("../models/User");
    const email = req.params.email.toLowerCase();

    const sc = await SubContractor.findOne({ email }).populate(
      "linkedEpcId",
      "companyName",
    );
    if (!sc) {
      return res.json({ found: false });
    }

    // Check if already has a user account with password set
    if (sc.userId) {
      const user = await User.findById(sc.userId);
      // Only consider "hasAccount" true if the user has a password set
      if (user && user.password) {
        return res.json({ found: true, hasAccount: true });
      }
    }

    res.json({
      found: true,
      hasAccount: false,
      linkedEpc: sc.linkedEpcId?.companyName || "Unknown Company",
      contactName: sc.contactName || "",
      companyName: sc.companyName || "",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { authenticate } = require("../middleware/auth");
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, phone } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
