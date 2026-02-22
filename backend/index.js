const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration for Multi-Domain Architecture
// Domain Structure:
//   Production (Vercel):
//   - gryork-public.vercel.app     : Public Website
//   - app-gryork.vercel.app        : Sub-Contractor Portal
//   - link-gryork.vercel.app       : GryLink Onboarding Portal
//   - partner-gryork.vercel.app    : Partner Portal (EPC/NBFC)
//   - official-gryork.vercel.app   : Official Portal (Sales, Ops, Admin)
//   - grylink-backend.vercel.app   : Backend API
//
//   Custom Domains (Future):
//   - gryork.com          : Public Website
//   - app.gryork.com      : Sub-Contractor Portal
//   - link.gryork.com     : GryLink Onboarding
//   - partner.gryork.com  : Partner Portal
//   - admin.gryork.com    : Internal Admin
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In development, allow all localhost origins
      if (
        process.env.NODE_ENV !== "production" &&
        origin.match(/^http:\/\/localhost:\d+$/)
      ) {
        return callback(null, true);
      }

      // Vercel deployment URLs
      const vercelOrigins = [
        "https://gryork-public.vercel.app",
        "https://app-gryork.vercel.app",
        "https://link-gryork.vercel.app",
        "https://partner-gryork.vercel.app",
        "https://official-gryork.vercel.app",
        "https://grylink-backend.vercel.app",
      ];

      if (vercelOrigins.includes(origin)) return callback(null, true);

      // Environment variable origins (for custom domains)
      const envOrigins = [
        process.env.PUBLIC_SITE_URL,
        process.env.SUBCONTRACTOR_PORTAL_URL,
        process.env.GRYLINK_PORTAL_URL,
        process.env.PARTNER_PORTAL_URL,
        process.env.ADMIN_PORTAL_URL,
        process.env.OFFICIAL_PORTAL_URL,
        process.env.GRYLINK_FRONTEND_URL,
      ].filter(Boolean);

      if (envOrigins.includes(origin)) return callback(null, true);

      // Allow all gryork.com subdomains
      if (origin.match(/^https:\/\/([\w-]+\.)?gryork\.com$/)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments for gryork
      if (origin.match(/^https:\/\/[\w-]+-gryork\.vercel\.app$/)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Gryork API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/company", require("./routes/company"));
app.use("/api/subcontractor", require("./routes/subcontractor"));
app.use("/api/ops", require("./routes/ops"));
app.use("/api/cases", require("./routes/cases"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/grylink", require("./routes/grylink"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/cwcrf", require("./routes/cwcrf")); // CWCRF workflow routes
app.use("/api/rmt", require("./routes/rmt")); // RMT dashboard routes

// SOP Compliance Routes
app.use("/api/nbfc", require("./routes/nbfc"));
app.use("/api/blacklist", require("./routes/blacklist"));
app.use("/api/transactions", require("./routes/transaction"));
app.use("/api/sla", require("./routes/sla"));
app.use("/api/approvals", require("./routes/approval"));
app.use("/api/risk-assessment", require("./routes/riskAssessment"));
app.use("/api/agents", require("./routes/agent"));
app.use("/api/rekyc", require("./routes/rekyc"));
app.use("/api/cron", require("./routes/cron"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/careers", require("./routes/careers"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

// Initialize cron jobs (only when NOT on Vercel — Vercel uses HTTP-triggered crons)
if (!process.env.VERCEL) {
  const { initializeCronJobs } = require("./config/cronJobs");
  initializeCronJobs();
}

// Start server (only when NOT on Vercel — Vercel handles this automatically)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
