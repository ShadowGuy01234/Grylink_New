const mongoose = require('mongoose');

// Cache the connection for serverless environments (Vercel)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedConnection = conn;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // In serverless, don't exit the process — let the function fail gracefully
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

