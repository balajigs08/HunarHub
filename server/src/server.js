require('dotenv').config();
// Server entry point
const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/config');

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`\n🚀 HunarHub Server running on port ${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API URL: http://localhost:${config.port}/api`);
    console.log(`❤️  Health: http://localhost:${config.port}/api/health\n`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
