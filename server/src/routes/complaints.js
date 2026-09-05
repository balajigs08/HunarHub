const express = require('express');
const router = express.Router();
const { getComplaints, getComplaintById, createComplaint, updateComplaint } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getComplaints);
router.get('/my-complaints', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.post('/', authenticate, authorize('customer'), createComplaint);
router.put('/:id', authenticate, authorize('admin'), updateComplaint);

module.exports = router;
