const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalEntrepreneurs,
      pendingEntrepreneurs,
      approvedEntrepreneurs,
      totalProducts,
      totalOrders,
      totalServiceRequests,
      totalComplaints,
      openComplaints,
      completedOrders,
      reviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      EntrepreneurProfile.countDocuments(),
      EntrepreneurProfile.countDocuments({ verificationStatus: 'pending' }),
      EntrepreneurProfile.countDocuments({ verificationStatus: 'approved' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      ServiceRequest.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Order.countDocuments({ orderStatus: 'completed' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const avgRating = reviews[0]?.avg ? Math.round(reviews[0].avg * 10) / 10 : 0;

    return sendSuccess(res, 'Dashboard data retrieved.', {
      stats: {
        totalUsers,
        totalCustomers,
        totalEntrepreneurs,
        pendingEntrepreneurs,
        approvedEntrepreneurs,
        totalProducts,
        totalOrders,
        totalServiceRequests,
        totalComplaints,
        openComplaints,
        completedOrders,
        totalRevenue,
        avgRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    // Monthly orders for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyRequests = await ServiceRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Service request conversion
    const totalReqs = await ServiceRequest.countDocuments();
    const completedReqs = await ServiceRequest.countDocuments({ status: 'completed' });
    const conversionRate = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

    // Top categories
    const topCategories = await EntrepreneurProfile.aggregate([
      { $match: { verificationStatus: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
    ]);

    // Average entrepreneur earnings
    const entrepreneursWithEarnings = await EntrepreneurProfile.aggregate([
      { $match: { verificationStatus: 'approved', totalEarnings: { $gt: 0 } } },
      { $group: { _id: null, avgEarnings: { $avg: '$totalEarnings' } } },
    ]);
    const avgEarnings = entrepreneursWithEarnings[0]?.avgEarnings || 0;

    // Product sales volume
    const salesVolume = await Order.aggregate([
      { $match: { orderStatus: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } },
    ]);

    return sendSuccess(res, 'Analytics retrieved.', {
      monthlyOrders,
      monthlyRequests,
      conversionRate,
      topCategories,
      avgEarnings: Math.round(avgEarnings),
      salesVolume: salesVolume[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all entrepreneurs (admin)
// @route   GET /api/admin/entrepreneurs
// @access  Admin
const getAdminEntrepreneurs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, category, verificationStatus } = req.query;

    const query = {};
    if (category) query.category = category;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'entrepreneur',
      }).select('_id');
      const userIds = users.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    const [entrepreneurs, total] = await Promise.all([
      EntrepreneurProfile.find(query)
        .populate('user', 'name email phone createdAt')
        .populate('category', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EntrepreneurProfile.countDocuments(query),
    ]);

    return sendPaginated(res, 'Entrepreneurs retrieved.', entrepreneurs, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Approve entrepreneur
// @route   PUT /api/admin/entrepreneurs/:id/approve
// @access  Admin
const approveEntrepreneur = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findById(req.params.id).populate('user', '_id name');
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);
    if (profile.verificationStatus === 'approved') {
      return sendError(res, 'Entrepreneur is already approved.', 400);
    }

    profile.verificationStatus = 'approved';
    profile.verifiedAt = new Date();
    profile.verificationNote = req.body.note || '';
    await profile.save();

    await createNotification({
      recipient: profile.user._id,
      type: 'entrepreneur_approved',
      title: 'Profile Approved! 🎉',
      message: 'Congratulations! Your entrepreneur profile has been approved. You can now start listing services and products.',
      data: { profileId: profile._id },
      link: '/entrepreneur/dashboard',
    });

    return sendSuccess(res, 'Entrepreneur approved successfully.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject entrepreneur
// @route   PUT /api/admin/entrepreneurs/:id/reject
// @access  Admin
const rejectEntrepreneur = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const profile = await EntrepreneurProfile.findById(req.params.id).populate('user', '_id name');
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);

    profile.verificationStatus = 'rejected';
    profile.verificationNote = reason || 'Does not meet platform requirements.';
    await profile.save();

    await createNotification({
      recipient: profile.user._id,
      type: 'entrepreneur_rejected',
      title: 'Profile Verification Update',
      message: `Your profile was not approved. Reason: ${reason || 'Does not meet platform requirements.'}`,
      data: { profileId: profile._id },
      link: '/entrepreneur/profile',
    });

    return sendSuccess(res, 'Entrepreneur rejected.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend entrepreneur
// @route   PUT /api/admin/entrepreneurs/:id/suspend
// @access  Admin
const suspendEntrepreneur = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const profile = await EntrepreneurProfile.findById(req.params.id).populate('user', '_id name');
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);

    profile.verificationStatus = 'suspended';
    profile.verificationNote = reason || 'Account suspended by admin.';
    await profile.save();

    await User.findByIdAndUpdate(profile.user._id, { isActive: false });

    await createNotification({
      recipient: profile.user._id,
      type: 'general',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support.',
      data: {},
      link: '/contact',
    });

    return sendSuccess(res, 'Entrepreneur suspended.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate entrepreneur
// @route   PUT /api/admin/entrepreneurs/:id/reactivate
// @access  Admin
const reactivateEntrepreneur = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findById(req.params.id).populate('user', '_id');
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);

    profile.verificationStatus = 'approved';
    profile.verificationNote = 'Account reactivated.';
    await profile.save();
    await User.findByIdAndUpdate(profile.user._id, { isActive: true });

    return sendSuccess(res, 'Entrepreneur reactivated.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get all products
// @route   GET /api/admin/products
// @access  Admin
const getAdminProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status, category } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate({ path: 'entrepreneur', populate: { path: 'user', select: 'name email' } })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return sendPaginated(res, 'Products retrieved.', products, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Admin toggle product status
// @route   PUT /api/admin/products/:id/toggle
// @access  Admin
const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found.', 404);
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();
    return sendSuccess(res, `Product ${product.status === 'active' ? 'activated' : 'deactivated'}.`, { product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  getAdminEntrepreneurs,
  approveEntrepreneur,
  rejectEntrepreneur,
  suspendEntrepreneur,
  reactivateEntrepreneur,
  getAdminProducts,
  toggleProductStatus,
};
