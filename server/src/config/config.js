const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hunarhub',
  jwtSecret: process.env.JWT_SECRET || 'hunarhub_dev_secret_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@hunarhub.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  customerEmail: process.env.CUSTOMER_EMAIL || 'customer@hunarhub.local',
  customerPassword: process.env.CUSTOMER_PASSWORD || 'Customer@12345',
  entrepreneurEmail: process.env.ENTREPRENEUR_EMAIL || 'entrepreneur@hunarhub.local',
  entrepreneurPassword: process.env.ENTREPRENEUR_PASSWORD || 'Entrepreneur@12345',
};
