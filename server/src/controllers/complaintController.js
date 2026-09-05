const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Customer (own) / Admin (all)
const getComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    if (status) query.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('user', 'name email')
        .populate('relatedOrder', 'totalAmount orderStatus')
        .populate('relatedServiceRequest', 'status description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(query),
    ]);

    return sendPaginated(res, 'Complaints retrieved.', complaints, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Customer (own) / Admin
const getComplaintById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.user = req.user._id;

    const complaint = await Complaint.findOne(query)
      .populate('user', 'name email')
      .populate('relatedOrder')
      .populate('relatedServiceRequest')
      .populate('respondedBy', 'name');

    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    return sendSuccess(res, 'Complaint retrieved.', { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Customer
const createComplaint = async (req, res, next) => {
  try {
    const { subject, description, relatedOrder, relatedServiceRequest, priority } = req.body;

    const complaint = await Complaint.create({
      user: req.user._id,
      subject,
      description,
      relatedOrder: relatedOrder || undefined,
      relatedServiceRequest: relatedServiceRequest || undefined,
      priority: priority || 'medium',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'new_complaint',
        title: 'New Complaint Filed',
        message: `${req.user.name} filed a complaint: "${subject}"`,
        data: { complaintId: complaint._id },
        link: `/admin/complaints/${complaint._id}`,
      });
    }

    return sendSuccess(res, 'Complaint submitted. We will review it soon.', { complaint }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint (admin)
// @route   PUT /api/complaints/:id
// @access  Admin
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminResponse, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    if (status) complaint.status = status;
    if (adminResponse) {
      complaint.adminResponse = adminResponse;
      complaint.respondedAt = new Date();
      complaint.respondedBy = req.user._id;
    }
    if (priority) complaint.priority = priority;

    await complaint.save();

    // Notify user if there's a response
    if (adminResponse) {
      await createNotification({
        recipient: complaint.user,
        type: 'complaint_updated',
        title: 'Complaint Update',
        message: `Your complaint "${complaint.subject}" has been updated.`,
        data: { complaintId: complaint._id },
        link: `/customer/complaints/${complaint._id}`,
      });
    }

    return sendSuccess(res, 'Complaint updated.', { complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComplaints, getComplaintById, createComplaint, updateComplaint };
