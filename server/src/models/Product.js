const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    entrepreneur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EntrepreneurProfile',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
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
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    condition: {
      type: String,
      enum: ['new', 'handmade', 'used', 'refurbished'],
      default: 'handmade',
    },
    location: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

productSchema.index({ entrepreneur: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
