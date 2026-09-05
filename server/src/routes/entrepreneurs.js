const express = require('express');
const router = express.Router();
const {
  getEntrepreneurs,
  getEntrepreneurById,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  updatePricing,
} = require('../controllers/entrepreneurController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', optionalAuth, getEntrepreneurs);
router.get('/me', authenticate, authorize('entrepreneur'), getMyProfile);
router.put('/me', authenticate, authorize('entrepreneur'), upload.single('profileImage'), updateMyProfile);
router.put('/me/availability', authenticate, authorize('entrepreneur'), updateAvailability);
router.put('/me/pricing', authenticate, authorize('entrepreneur'), updatePricing);
router.get('/:id', optionalAuth, getEntrepreneurById);

module.exports = router;
