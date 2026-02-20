const cloudinary = require('../config/cloudinary');

/**
 * Upload a buffer to Cloudinary (options-based signature).
 * @param {Buffer} fileBuffer - file content
 * @param {string} mimeType  - e.g. "application/pdf", "image/png"
 * @param {object} [options]  - { folder, resource_type, filename }
 */
const uploadToCloudinary = async (fileBuffer, mimeType, options = {}) => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${b64}`;

  // Determine resource_type based on mime type if not explicitly set
  let resourceType = options.resource_type || 'auto';
  if (!options.resource_type) {
    if (mimeType && mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType === 'application/pdf' || (mimeType && !mimeType.startsWith('image/'))) {
      resourceType = 'raw';
    } else {
      resourceType = 'raw';
    }
  }

  const uploadOptions = {
    folder: options.folder || 'gryork/documents',
    resource_type: resourceType,
  };

  // For raw uploads (PDFs), preserve file extension in public_id for browser display
  if (options.filename && resourceType === 'raw') {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = options.filename.split('.').pop() || 'pdf';
    uploadOptions.public_id = `${timestamp}_${randomStr}.${ext}`;
  }

  return cloudinary.uploader.upload(dataUri, uploadOptions);
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
