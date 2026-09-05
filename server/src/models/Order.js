const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EntrepreneurProfile',
  },
  name: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'demo', 'upi', 'card', 'cod', 'online'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    cancelledAt: Date,
    completedAt: Date,
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'items.entrepreneur': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
