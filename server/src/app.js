const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const entrepreneurRoutes = require('./routes/entrepreneurs');
const categoryRoutes = require('./routes/categories');
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const serviceRequestRoutes = require('./routes/serviceRequests');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');

const app = express();
// Server app instance

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === config.clientUrl) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 5000 : 20,
  skip: () => config.nodeEnv === 'development',
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'HunarHub API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entrepreneurs', entrepreneurRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
