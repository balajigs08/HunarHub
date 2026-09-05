const mongoose = require('mongoose');
const config = require('./config');

/**
 * Global cached connection for serverless environment (Vercel/AWS Lambda)
 * to reuse established database connections across function invocations.
 */
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || config.mongoUri;
  const isProduction = process.env.NODE_ENV === 'production' || config.nodeEnv === 'production';

  // Enforcement: No localhost fallback in production
  if (isProduction && (!uri || uri.includes('localhost') || uri.includes('127.0.0.1'))) {
    throw new Error('MongoDB Connection Error: MONGODB_URI environment variable is required and cannot be localhost in production.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    // Sanitize URI for safe logging without exposing passwords
    const sanitizedHost = uri ? (uri.includes('@') ? uri.split('@')[1] : 'localhost') : 'unknown';
    console.log(`Connecting to MongoDB host: ${sanitizedHost}...`);

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB connected successfully to ${sanitizedHost}`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        console.error(`❌ MongoDB primary connection failed: ${err.message}`);
        cached.promise = null;

        // In development only, attempt MongoMemoryServer fallback if local Mongo is not running
        if (!isProduction) {
          console.warn('⚠️ Development mode: Attempting embedded MongoMemoryServer fallback...');
          try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            const memConn = await mongoose.connect(memoryUri, opts);
            console.log(`✅ In-Memory MongoDB connected: ${memConn.connection.host}`);

            const { seedData } = require('../seed/seed');
            await seedData();
            return memConn;
          } catch (fallbackErr) {
            console.error(`❌ MongoMemoryServer fallback error: ${fallbackErr.message}`);
            throw err;
          }
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
