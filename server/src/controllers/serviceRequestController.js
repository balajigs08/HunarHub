const ServiceRequest = require('../models/ServiceRequest');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Service = require('../models/Service');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

// @desc    Get service requests
// @route   GET /api/service-requests
// @access  Customer / Entrepreneur / Admin
const getServiceRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
      if (!profile) return sendError(res, 'Profile not found.', 404);
      query.entrepreneur = profile._id;
    }
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('customer', 'name email phone avatar location')
        .populate({ path: 'entrepreneur', select: 'businessName profileImage', populate: { path: 'user', select: 'name' } })
        .populate('service', 'title price priceType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServiceRequest.countDocuments(query),
    ]);

    return sendPaginated(res, 'Service requests retrieved.', requests, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get service request by ID
// @route   GET /api/service-requests/:id
// @access  Customer / Entrepreneur / Admin
const getServiceRequestById = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email phone avatar location')
      .populate({ path: 'entrepreneur', populate: { path: 'user', select: 'name avatar' } })
      .populate('service', 'title price priceType description');

    if (!request) return sendError(res, 'Service request not found.', 404);

    if (
      req.user.role === 'customer' &&
      request.customer._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'Not authorized.', 403);
    }

    return sendSuccess(res, 'Service request retrieved.', { request });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service request
// @route   POST /api/service-requests
// @access  Customer
const createServiceRequest = async (req, res, next) => {
  try {
    const { entrepreneurId, serviceId, description, preferredDate, preferredTime, location, budget } = req.body;

    const profile = await EntrepreneurProfile.findById(entrepreneurId);
    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);
    if (profile.verificationStatus !== 'approved') {
      return sendError(res, 'This entrepreneur is not available for requests.', 400);
    }
    if (!profile.availability.isAvailable) {
      return sendError(res, 'This entrepreneur is currently unavailable.', 400);
    }

    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service || service.status !== 'active' || !service.isAvailable) {
        return sendError(res, 'Selected service is not available.', 400);
      }
    }

    const request = await ServiceRequest.create({
      customer: req.user._id,
      entrepreneur: profile._id,
      service: serviceId || undefined,
      description,
      preferredDate,
      preferredTime,
      location,
      budget: budget || 0,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });

    if (serviceId) {
      await Service.findByIdAndUpdate(serviceId, { $inc: { totalRequests: 1 } });
    }

    // Notify entrepreneur
    await createNotification({
      recipient: profile.user,
      type: 'service_request_received',
      title: 'New Service Request!',
      message: `${req.user.name} has sent you a service request.`,
      data: { requestId: request._id },
      link: `/entrepreneur/requests/${request._id}`,
    });

    return sendSuccess(res, 'Service request submitted successfully.', { request }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id/status
// @access  Entrepreneur / Customer (cancel only)
const updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, note, agreedPrice } = req.body;

    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name _id')
      .populate({ path: 'entrepreneur', populate: { path: 'user', select: '_id name' } });

    if (!request) return sendError(res, 'Request not found.', 404);

    // Authorization
    if (req.user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
      if (request.entrepreneur._id.toString() !== profile._id.toString()) {
        return sendError(res, 'Not authorized.', 403);
      }
    } else if (req.user.role === 'customer') {
      if (request.customer._id.toString() !== req.user._id.toString()) {
        return sendError(res, 'Not authorized.', 403);
      }
      if (status !== 'cancelled') {
        return sendError(res, 'Customers can only cancel requests.', 403);
      }
    }

    // Validate transitions
    const validTransitions = ServiceRequest.validTransitions;
    if (!validTransitions[request.status]?.includes(status)) {
      return sendError(res, `Cannot transition from "${request.status}" to "${status}".`, 400);
    }

    request.status = status;
    if (status === 'completed') request.completedAt = new Date();
    if (status === 'cancelled') request.cancelledAt = new Date();
    if (agreedPrice !== undefined) request.agreedPrice = agreedPrice;
    if (note) request.rejectionReason = note;
    request.statusHistory.push({ status, changedBy: req.user._id, note });

    await request.save();

    // Notifications
    let notificationType, notifTitle, notifMsg, recipientId, recipientLink;
    if (req.user.role === 'entrepreneur') {
      recipientId = request.customer._id;
      recipientLink = `/customer/requests/${request._id}`;
      if (status === 'accepted') {
        notificationType = 'service_request_accepted';
        notifTitle = 'Service Request Accepted!';
        notifMsg = 'Your service request has been accepted.';
      } else if (status === 'rejected') {
        notificationType = 'service_request_rejected';
        notifTitle = 'Service Request Rejected';
        notifMsg = `Your service request was rejected. Reason: ${note || 'Not specified'}`;
      } else if (status === 'completed') {
        notificationType = 'service_request_completed';
        notifTitle = 'Service Completed!';
        notifMsg = 'Your service request has been marked as completed.';
        // Update entrepreneur earnings
        const earnAmount = request.agreedPrice || request.budget || 0;
        if (earnAmount > 0) {
          const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
          await EntrepreneurProfile.findByIdAndUpdate(profile._id, { $inc: { totalEarnings: earnAmount } });
        }
      }
    } else if (req.user.role === 'customer') {
      recipientId = request.entrepreneur.user._id;
      recipientLink = `/entrepreneur/requests/${request._id}`;
      notificationType = 'service_request_cancelled';
      notifTitle = 'Service Request Cancelled';
      notifMsg = `${request.customer.name} has cancelled their service request.`;
    }

    if (recipientId && notificationType) {
      await createNotification({
        recipient: recipientId,
        type: notificationType,
        title: notifTitle,
        message: notifMsg,
        data: { requestId: request._id },
        link: recipientLink,
      });
    }

    return sendSuccess(res, 'Request status updated.', { request });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service request
// @route   DELETE /api/service-requests/:id
// @access  Customer
const deleteServiceRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, customer: req.user._id });
    if (!request) return sendError(res, 'Request not found.', 404);
    if (!['pending', 'rejected', 'cancelled'].includes(request.status)) {
      return sendError(res, 'Cannot delete an active or completed request.', 400);
    }
    await request.deleteOne();
    return sendSuccess(res, 'Request deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
};
