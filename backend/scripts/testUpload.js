require('dotenv').config();
const cloudinary = require('../config/cloudinary');

async function testUpload() {
  console.log('Testing Cloudinary Upload...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

  try {
    // Small 1x1 transparent GIF base64
    const base64Image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    console.log('Attempting upload of small base64 image...');
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'gryork/test',
    });
    
    console.log('✅ Upload successful!');
    console.log('  Public ID:', result.public_id);
    console.log('  URL:', result.secure_url);
    
    // Cleanup
    await cloudinary.uploader.destroy(result.public_id);
    console.log('  (Cleaned up test file)');
    
  } catch (error) {
    console.error('❌ Upload failed');
    console.error('  Status:', error.http_code || error.statusCode);
    console.error('  Message:', error.message);
    if (error.error) console.error('  Details:', error.error);
  }
  process.exit(0);
}

testUpload();
