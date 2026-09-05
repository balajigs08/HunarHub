const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    relatedServiceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

complaintSchema.index({ user: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
