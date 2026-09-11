const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerCustomer, registerEntrepreneur, login, getMe, logout } = require('../controllers/authController');
const { seedDemoUsers } = require('../controllers/seedController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('city').optional().trim(),
  ],
  validate,
  registerCustomer
);

router.post(
  '/register/entrepreneur',
  upload.single('profileImage'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('businessName').trim().notEmpty().withMessage('Business/skill name is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('city').optional().trim(),
  ],
  validate,
  registerEntrepreneur
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

// Production-safe demo user seeder (idempotent, upsert-only, never deletes data)
router.post('/seed-demo-users', seedDemoUsers);

module.exports = router;
