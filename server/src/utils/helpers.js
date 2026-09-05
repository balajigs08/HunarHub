const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
};

module.exports = { generateToken, getPaginationParams, getPaginationMeta };
