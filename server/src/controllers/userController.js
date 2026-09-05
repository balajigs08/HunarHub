const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'entrepreneur') {
      profile = await EntrepreneurProfile.findOne({ user: user._id }).populate('category');
    }
    return sendSuccess(res, 'Profile retrieved.', { user, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, address } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (city) updates['location.city'] = city;
    if (address) updates['location.address'] = address;

    // Handle avatar upload
    if (req.file) {
      if (req.user.avatar && req.user.avatar.public_id) {
        await deleteFromCloudinary(req.user.avatar.public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, 'hunarhub/avatars');
      updates['avatar.url'] = uploaded.url;
      updates['avatar.public_id'] = uploaded.public_id;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return sendSuccess(res, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers (admin)
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 'Users retrieved.', {
      users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers };
