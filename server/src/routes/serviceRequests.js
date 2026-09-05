const express = require('express');
const router = express.Router();
const {
  getServiceRequests, getServiceRequestById, createServiceRequest, updateServiceRequestStatus, deleteServiceRequest
} = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getServiceRequests);
router.get('/my-requests', authenticate, getServiceRequests);
router.get('/entrepreneur-requests', authenticate, getServiceRequests);
router.get('/:id', authenticate, getServiceRequestById);
router.post('/', authenticate, authorize('customer'), createServiceRequest);
router.put('/:id/status', authenticate, authorize('entrepreneur', 'customer', 'admin'), updateServiceRequestStatus);
router.delete('/:id', authenticate, authorize('customer'), deleteServiceRequest);

module.exports = router;
