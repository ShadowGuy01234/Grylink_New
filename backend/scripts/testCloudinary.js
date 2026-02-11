require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function testCloudinary() {
  console.log('Testing with config:');
  console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('  API Key:', process.env.CLOUDINARY_API_KEY);
  console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '***set***' : '***MISSING***');

  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
  } catch (error) {
    console.error('❌ Cloudinary connection failed');
    console.error('  Status:', error.http_code || error.statusCode);
    console.error('  Message:', error.message);
    console.error('  Full error:', JSON.stringify(error, null, 2));
  }
  process.exit(0);
}

testCloudinary();
