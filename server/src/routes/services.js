const express = require('express');
const router = express.Router();
const {
  getServices, getServiceById, getMyServices, createService, updateService, deleteService
} = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getServices);
router.get('/my', authenticate, authorize('entrepreneur'), getMyServices);
router.get('/:id', getServiceById);
router.post('/', authenticate, authorize('entrepreneur'), upload.array('images', 5), createService);
router.put('/:id', authenticate, authorize('entrepreneur'), upload.array('images', 5), updateService);
router.delete('/:id', authenticate, authorize('entrepreneur'), deleteService);

module.exports = router;
