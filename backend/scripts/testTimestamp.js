require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function testTimestamp() {
  console.log('--- Testing Timestamp Hypothesis ---');
  console.log('System Time:', new Date().toISOString());
  
  // Try with current time (already failed)
  // Try with time - 1 year (approx 2025)
  const oneYearAgo = Math.floor(Date.now() / 1000) - 31536000;
  console.log('Testing with timestamp -1 year:', new Date(oneYearAgo * 1000).toISOString());

  try {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
    // We must pass timestamp to upload otherwise SDK generates it
    const upload = await cloudinary.uploader.upload(base64Image, {
      folder: 'diagnostics',
      timestamp: oneYearAgo
    });
    console.log('   ✅ Upload Success with adjusted timestamp:', upload.secure_url);
    await cloudinary.uploader.destroy(upload.public_id);
  } catch (err) {
    console.error('   ❌ Upload Failed with adjusted timestamp:', err.message);
    if (err.http_code) console.error('   HTTP Code:', err.http_code);
  }
  process.exit(0);
}

testTimestamp();
