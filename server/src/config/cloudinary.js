const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const config = require('./config');

const isCloudinaryConfigured =
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

// Memory storage fallback when Cloudinary is not configured
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
    }
  },
});

const uploadToCloudinary = async (buffer, folder = 'hunarhub') => {
  if (!isCloudinaryConfigured) {
    // Return a demo placeholder image when Cloudinary is not configured
    return {
      url: `https://picsum.photos/seed/${Date.now()}/400/300`,
      public_id: `demo_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, public_id: result.public_id });
      }
    ).end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId || publicId.startsWith('demo_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured };
