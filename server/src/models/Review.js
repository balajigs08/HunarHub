const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same transaction
reviewSchema.index(
  { customer: 1, order: 1 },
  { unique: true, partialFilterExpression: { order: { $exists: true } } }
);
reviewSchema.index(
  { customer: 1, serviceRequest: 1 },
  { unique: true, partialFilterExpression: { serviceRequest: { $exists: true } } }
);
reviewSchema.index({ entrepreneur: 1 });
reviewSchema.index({ rating: -1 });

// Auto update entrepreneur rating after review
reviewSchema.post('save', async function () {
  const EntrepreneurProfile = mongoose.model('EntrepreneurProfile');
  const reviews = await mongoose.model('Review').find({ entrepreneur: this.entrepreneur });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  await EntrepreneurProfile.findByIdAndUpdate(this.entrepreneur, {
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
  });
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const EntrepreneurProfile = mongoose.model('EntrepreneurProfile');
    const reviews = await mongoose.model('Review').find({ entrepreneur: doc.entrepreneur });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    await EntrepreneurProfile.findByIdAndUpdate(doc.entrepreneur, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
