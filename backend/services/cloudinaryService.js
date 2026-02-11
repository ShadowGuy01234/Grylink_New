const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto', mimeType = 'application/octet-stream') => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataUri = `data:${mimeType};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: `gryork/${folder}`,
    resource_type: resourceType,
  });
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
