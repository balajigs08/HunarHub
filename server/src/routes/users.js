const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.put('/password', authenticate, changePassword);
router.get('/', authenticate, authorize('admin'), getAllUsers);

module.exports = router;
