const Review = require('../models/Review');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

// @desc    Get reviews for an entrepreneur
// @route   GET /api/reviews?entrepreneurId=xxx
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { entrepreneurId } = req.query;

    const query = {};
    if (entrepreneurId) query.entrepreneur = entrepreneurId;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    // Rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (entrepreneurId) {
      const allReviews = await Review.find({ entrepreneur: entrepreneurId }).select('rating');
      allReviews.forEach((r) => {
        ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
      });
    }

    return sendPaginated(res, 'Reviews retrieved.', { reviews, ratingDistribution }, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Customer
const createReview = async (req, res, next) => {
  try {
    const { entrepreneurId, orderId, serviceRequestId, rating, comment } = req.body;

    // Verify eligible transaction
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        customer: req.user._id,
        orderStatus: 'completed',
      });
      if (!order) {
        return sendError(res, 'You can only review after a completed order.', 400);
      }
      // Check duplicate
      const existing = await Review.findOne({ customer: req.user._id, order: orderId });
      if (existing) return sendError(res, 'You have already reviewed this order.', 409);
    } else if (serviceRequestId) {
      const request = await ServiceRequest.findOne({
        _id: serviceRequestId,
        customer: req.user._id,
        status: 'completed',
      });
      if (!request) {
        return sendError(res, 'You can only review after a completed service request.', 400);
      }
      const existing = await Review.findOne({ customer: req.user._id, serviceRequest: serviceRequestId });
      if (existing) return sendError(res, 'You have already reviewed this service.', 409);
    } else {
      return sendError(res, 'Please provide an order or service request ID.', 400);
    }

    const profile = await EntrepreneurProfile.findById(entrepreneurId);
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);

    const review = await Review.create({
      customer: req.user._id,
      entrepreneur: entrepreneurId,
      order: orderId || undefined,
      serviceRequest: serviceRequestId || undefined,
      rating: parseInt(rating),
      comment,
      isVerifiedPurchase: true,
    });

    await review.populate('customer', 'name avatar');

    // Notify entrepreneur
    await createNotification({
      recipient: profile.user,
      type: 'review_received',
      title: 'New Review Received!',
      message: `${req.user.name} gave you a ${rating}-star review.`,
      data: { reviewId: review._id, entrepreneurId },
      link: '/entrepreneur/dashboard',
    });

    return sendSuccess(res, 'Review submitted successfully.', { review }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Customer / Admin
const deleteReview = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.customer = req.user._id;

    const review = await Review.findOneAndDelete(query);
    if (!review) return sendError(res, 'Review not found or unauthorized.', 404);

    return sendSuccess(res, 'Review deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, deleteReview };
