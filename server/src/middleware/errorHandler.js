const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the 5MB limit.';
  }

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

const notFound = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFound };
