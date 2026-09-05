const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'service_request_accepted',
        'service_request_rejected',
        'service_request_received',
        'service_request_cancelled',
        'service_request_completed',
        'order_placed',
        'order_confirmed',
        'order_status_changed',
        'order_cancelled',
        'review_received',
        'complaint_updated',
        'entrepreneur_registered',
        'entrepreneur_approved',
        'entrepreneur_rejected',
        'new_complaint',
        'general',
      ],
      default: 'general',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
