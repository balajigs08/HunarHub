const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: '🛠️',
    },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
