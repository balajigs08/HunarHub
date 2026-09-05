const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EntrepreneurProfile',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceType: {
      type: String,
      enum: ['fixed', 'starting_from', 'hourly'],
      default: 'fixed',
    },
    estimatedTime: {
      value: { type: Number, default: 1 },
      unit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'days' },
    },
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ entrepreneur: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ price: 1 });

module.exports = mongoose.model('Service', serviceSchema);
