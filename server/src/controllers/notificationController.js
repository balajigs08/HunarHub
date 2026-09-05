const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return sendSuccess(res, 'Notifications retrieved.', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found.', 404);
    return sendSuccess(res, 'Marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return sendSuccess(res, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
