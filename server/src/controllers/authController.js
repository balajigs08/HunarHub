const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Category = require('../models/Category');
const { generateToken } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotification } = require('../services/notificationService');

// @desc    Register new user (customer)
// @route   POST /api/auth/register
// @access  Public
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
      location: { city },
    });

    const token = generateToken(user._id);
    return sendSuccess(res, 'Registration successful! Welcome to HunarHub.', { token, user }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Register new entrepreneur
// @route   POST /api/auth/register/entrepreneur
// @access  Public
const registerEntrepreneur = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      categoryId,
      skills,
      experienceYears,
      experienceDescription,
      city,
      address,
      about,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return sendError(res, 'Invalid category selected.', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'entrepreneur',
      location: { city, address },
    });

    // Handle profile image upload
    let profileImage = { url: '', public_id: '' };
    if (req.file) {
      const { uploadToCloudinary } = require('../config/cloudinary');
      profileImage = await uploadToCloudinary(req.file.buffer, 'hunarhub/profiles');
    }

    const entrepreneurProfile = await EntrepreneurProfile.create({
      user: user._id,
      businessName,
      category: category._id,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim())) : [],
      experience: {
        years: experienceYears || 0,
        description: experienceDescription || '',
      },
      location: { city, address },
      about: about || '',
      profileImage,
      verificationStatus: 'pending',
    });

    // Notify admin about new entrepreneur registration
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'entrepreneur_registered',
        title: 'New Entrepreneur Registration',
        message: `${name} has registered as an entrepreneur and is awaiting approval.`,
        data: { entrepreneurId: entrepreneurProfile._id },
        link: '/admin/entrepreneurs',
      });
    }

    const token = generateToken(user._id);
    return sendSuccess(
      res,
      'Entrepreneur registration successful! Your profile is under review.',
      { token, user, profile: entrepreneurProfile },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : email;
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Contact support.', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    let profile = null;
    if (user.role === 'entrepreneur') {
      profile = await EntrepreneurProfile.findOne({ user: user._id }).populate('category', 'name icon');
    }

    const token = generateToken(user._id);
    return sendSuccess(res, 'Login successful!', { token, user, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'entrepreneur') {
      profile = await EntrepreneurProfile.findOne({ user: user._id })
        .populate('category', 'name icon slug');
    }
    return sendSuccess(res, 'User retrieved successfully.', { user, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  return sendSuccess(res, 'Logged out successfully.');
};

module.exports = { registerCustomer, registerEntrepreneur, login, getMe, logout };
