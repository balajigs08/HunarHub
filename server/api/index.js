const app = require('../src/app');
const connectDB = require('../src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel serverless DB initialization error:', err.message);
  }
  return app(req, res);
};
