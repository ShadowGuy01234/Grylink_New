const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration for Multi-Domain Architecture
// Domain Structure:
//   - gryork.com          : Public Website
//   - app.gryork.com      : Sub-Contractor Portal
//   - link.gryork.com     : GryLink Onboarding (EPC/NBFC)
//   - partner.gryork.com  : EPC & NBFC Portal
//   - admin.gryork.com    : Internal Admin (Sales, Ops)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = [
      process.env.PUBLIC_SITE_URL,           // gryork.com
      process.env.SUBCONTRACTOR_PORTAL_URL,  // app.gryork.com
      process.env.GRYLINK_PORTAL_URL,        // link.gryork.com
      process.env.PARTNER_PORTAL_URL,        // partner.gryork.com
      process.env.ADMIN_PORTAL_URL,          // admin.gryork.com
      // Legacy env vars for backward compatibility
      process.env.GRYLINK_FRONTEND_URL,
      process.env.OFFICIAL_PORTAL_URL,
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Also allow all gryork.com subdomains in production
    if (origin.match(/^https:\/\/([\w-]+\.)?gryork\.com$/)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Gryork API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/company', require('./routes/company'));
app.use('/api/subcontractor', require('./routes/subcontractor'));
app.use('/api/ops', require('./routes/ops'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/grylink', require('./routes/grylink'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
