const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB service not detected on ${config.mongoUri}. Starting embedded MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB database connected: ${conn.connection.host}`);

      // Auto-populate demo dataset
      const { seedData } = require('../seed/seed');
      await seedData();
    } catch (fallbackError) {
      console.error(`❌ MongoDB connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
