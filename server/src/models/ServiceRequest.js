const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EntrepreneurProfile',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    description: {
      type: String,
      required: [true, 'Request description is required'],
      trim: true,
    },
    preferredDate: {
      type: Date,
    },
    preferredTime: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    budget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    completedAt: Date,
    cancelledAt: Date,
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    agreedPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Valid status transitions
serviceRequestSchema.statics.validTransitions = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  rejected: [],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

serviceRequestSchema.index({ customer: 1 });
serviceRequestSchema.index({ entrepreneur: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
