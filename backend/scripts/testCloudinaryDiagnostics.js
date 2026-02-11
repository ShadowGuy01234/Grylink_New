require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function testCloudinaryDiagnostics() {
  console.log('--- Cloudinary Diagnostics ---');
  
  // 1. Check Config
  console.log('1. Checking Config...');
  const config = cloudinary.config();
  console.log('   Cloud Name:', config.cloud_name);
  console.log('   API Key:', config.api_key);
  console.log('   API Secret Length:', config.api_secret?.length);
  
  // 2. Test Admin API (Resources)
  console.log('\n2. Testing Admin API (Get Resources)...');
  try {
    const resources = await cloudinary.api.resources({ max_results: 1 });
    console.log('   ✅ Admin API Success. Rate Limit Remaining:', resources.rate_limit_remaining);
  } catch (err) {
    console.error('   ❌ Admin API Failed:', err.message);
    console.error('   Details:', err.error);
  }

  // 3. Test Upload API (Base64)
  console.log('\n3. Testing Upload API (Base64)...');
  try {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
    const upload = await cloudinary.uploader.upload(base64Image, {
      folder: 'diagnostics',
      resource_type: 'image'
    });
    console.log('   ✅ Upload API Success:', upload.secure_url);
    // Cleanup
    await cloudinary.uploader.destroy(upload.public_id);
  } catch (err) {
    console.error('   ❌ Upload API Failed:', err.message);
    if (err.http_code) console.error('   HTTP Code:', err.http_code);
    if (err.error) console.error('   Error Object:', JSON.stringify(err.error, null, 2));
  }
  
  process.exit(0);
}

testCloudinaryDiagnostics();
