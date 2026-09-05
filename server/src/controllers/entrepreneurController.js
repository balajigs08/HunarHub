const mongoose = require('mongoose');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all approved entrepreneurs (public)
// @route   GET /api/entrepreneurs
// @access  Public
const getEntrepreneurs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, category, city, minPrice, maxPrice, minRating, availability, sort } = req.query;

    const query = { verificationStatus: 'approved', isActive: true };

    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (availability === 'true') query['availability.isAvailable'] = true;
    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.startingPrice.$lte = parseFloat(maxPrice);
    }

    let userQuery = {};
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
      // Find matching users first
      const matchingUsers = await User.find(userQuery).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      // Also search in entrepreneurProfile fields
      query.$or = [
        { user: { $in: userIds } },
        { businessName: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'price_asc') sortOption = { startingPrice: 1 };
    else if (sort === 'price_desc') sortOption = { startingPrice: -1 };

    const [entrepreneurs, total] = await Promise.all([
      EntrepreneurProfile.find(query)
        .populate('user', 'name email phone location avatar')
        .populate('category', 'name icon slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      EntrepreneurProfile.countDocuments(query),
    ]);

    return sendPaginated(res, 'Entrepreneurs retrieved.', entrepreneurs, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get entrepreneur by ID (public)
// @route   GET /api/entrepreneurs/:id
// @access  Public
const getEntrepreneurById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(idParam)) {
      return sendError(res, 'Invalid entrepreneur ID format.', 400);
    }

    let profile = await EntrepreneurProfile.findById(idParam)
      .populate('user', 'name email phone location avatar createdAt')
      .populate('category', 'name icon slug');

    if (!profile) {
      profile = await EntrepreneurProfile.findOne({ user: idParam })
        .populate('user', 'name email phone location avatar createdAt')
        .populate('category', 'name icon slug');
    }

    if (!profile) return sendError(res, 'Entrepreneur not found.', 404);
    if (profile.verificationStatus !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'This entrepreneur profile is not publicly available yet.', 403);
    }

    return sendSuccess(res, 'Entrepreneur retrieved.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get own entrepreneur profile
// @route   GET /api/entrepreneurs/me
// @access  Entrepreneur
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id })
      .populate('category', 'name icon slug');
    if (!profile) return sendError(res, 'Entrepreneur profile not found.', 404);
    return sendSuccess(res, 'Profile retrieved.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update entrepreneur profile
// @route   PUT /api/entrepreneurs/me
// @access  Entrepreneur
const updateMyProfile = async (req, res, next) => {
  try {
    const { businessName, skills, experienceYears, experienceDescription, city, address, about, socialLinks } = req.body;

    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Entrepreneur profile not found.', 404);

    if (businessName) profile.businessName = businessName;
    if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (experienceYears !== undefined) profile.experience.years = experienceYears;
    if (experienceDescription) profile.experience.description = experienceDescription;
    if (city) profile.location.city = city;
    if (address) profile.location.address = address;
    if (about) profile.about = about;
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

    // Handle profile image upload
    if (req.file) {
      if (profile.profileImage && profile.profileImage.public_id) {
        await deleteFromCloudinary(profile.profileImage.public_id);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, 'hunarhub/profiles');
      profile.profileImage = uploaded;
    }

    await profile.save();
    await profile.populate('category', 'name icon slug');

    return sendSuccess(res, 'Profile updated successfully.', { profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update availability
// @route   PUT /api/entrepreneurs/me/availability
// @access  Entrepreneur
const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable, workingDays, workingHours } = req.body;
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Profile not found.', 404);

    if (isAvailable !== undefined) profile.availability.isAvailable = isAvailable;
    if (workingDays) profile.availability.workingDays = workingDays;
    if (workingHours) profile.availability.workingHours = workingHours;

    await profile.save();
    return sendSuccess(res, 'Availability updated.', { availability: profile.availability });
  } catch (error) {
    next(error);
  }
};

// @desc    Update starting price
// @route   PUT /api/entrepreneurs/me/pricing
// @access  Entrepreneur
const updatePricing = async (req, res, next) => {
  try {
    const { startingPrice } = req.body;
    const profile = await EntrepreneurProfile.findOneAndUpdate(
      { user: req.user._id },
      { startingPrice },
      { new: true }
    );
    return sendSuccess(res, 'Pricing updated.', { profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntrepreneurs,
  getEntrepreneurById,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  updatePricing,
};
