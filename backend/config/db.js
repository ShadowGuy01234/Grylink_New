const mongoose = require('mongoose');
const dns = require('dns');

// Cache the connection for serverless environments (Vercel)
let cachedConnection = null;
let dnsOverrideApplied = false;

function parseDnsServers(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
}

function shouldRetryWithDnsOverride(uri, error) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return false;
  const message = String(error?.message || '');
  return (
    message.includes('querySrv ECONNREFUSED') ||
    message.includes('queryA ECONNREFUSED')
  );
}

function getDnsOverrideServers() {
  const envServers = parseDnsServers(process.env.MONGODB_DNS_SERVERS);
  if (envServers.length > 0) return envServers;

  // Keep production conservative: only auto-apply public DNS defaults in development.
  if (process.env.NODE_ENV !== 'production') {
    return ['8.8.8.8', '8.8.4.4'];
  }

  return [];
}

function applyDnsOverrideForMongo(uri) {
  if (dnsOverrideApplied || !uri || !uri.startsWith('mongodb+srv://')) {
    return;
  }

  const dnsServers = getDnsOverrideServers();
  if (dnsServers.length === 0) {
    return;
  }

  dns.setServers(dnsServers);
  dnsOverrideApplied = true;
  console.log(`MongoDB DNS servers set to: ${dnsServers.join(', ')}`);
}

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  // Apply DNS override up-front for mongodb+srv so first connect succeeds directly.
  applyDnsOverrideForMongo(uri);

  try {
    const conn = await mongoose.connect(uri);
    cachedConnection = conn;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (shouldRetryWithDnsOverride(uri, error)) {
      const dnsServers = getDnsOverrideServers();
      if (dnsServers.length > 0) {
        try {
          dns.setServers(dnsServers);
          console.warn(
            `MongoDB SRV lookup failed with resolver error. Retrying with DNS servers: ${dnsServers.join(', ')}`,
          );

          const conn = await mongoose.connect(uri);
          cachedConnection = conn;
          console.log(`MongoDB connected after DNS override: ${conn.connection.host}`);
          return conn;
        } catch (retryError) {
          error = retryError;
        }
      }
    }

    console.error(`MongoDB connection error: ${error.message}`);
    // In serverless, don't exit the process — let the function fail gracefully
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

