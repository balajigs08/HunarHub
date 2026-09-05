const express = require('express');
const router = express.Router();
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', authenticate, authorize('customer'), createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
