const mongoose = require('mongoose');

const entrepreneurProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business/skill name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      years: { type: Number, default: 0 },
      description: { type: String, trim: true, default: '' },
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      city: { type: String, trim: true },
      address: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    profileImage: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationNote: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      workingDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
      },
    },
    startingPrice: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    socialLinks: {
      whatsapp: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

entrepreneurProfileSchema.index({ category: 1 });
entrepreneurProfileSchema.index({ verificationStatus: 1 });
entrepreneurProfileSchema.index({ averageRating: -1 });
entrepreneurProfileSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('EntrepreneurProfile', entrepreneurProfileSchema);
