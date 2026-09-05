const Service = require('../models/Service');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { category, minPrice, maxPrice, search, entrepreneurId } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;
    if (entrepreneurId) query.entrepreneur = entrepreneurId;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate({ path: 'entrepreneur', populate: { path: 'user', select: 'name avatar' } })
        .populate('category', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Service.countDocuments(query),
    ]);

    return sendPaginated(res, 'Services retrieved.', services, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({ path: 'entrepreneur', populate: [{ path: 'user', select: 'name avatar' }, { path: 'category', select: 'name' }] })
      .populate('category', 'name icon');
    if (!service) return sendError(res, 'Service not found.', 404);
    return sendSuccess(res, 'Service retrieved.', { service });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my services
// @route   GET /api/services/my
// @access  Entrepreneur
const getMyServices = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Entrepreneur profile not found.', 404);

    const services = await Service.find({ entrepreneur: profile._id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Services retrieved.', { services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Entrepreneur
const createService = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Entrepreneur profile not found.', 404);

    const { title, description, category, price, priceType, estimatedValue, estimatedUnit, isAvailable } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'hunarhub/services');
        images.push(uploaded);
      }
    }

    const service = await Service.create({
      entrepreneur: profile._id,
      title,
      description,
      category,
      price: parseFloat(price),
      priceType: priceType || 'fixed',
      estimatedTime: { value: estimatedValue || 1, unit: estimatedUnit || 'days' },
      images,
      isAvailable: isAvailable !== 'false',
    });

    await service.populate('category', 'name icon');
    return sendSuccess(res, 'Service created.', { service }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Entrepreneur
const updateService = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    const service = await Service.findOne({ _id: req.params.id, entrepreneur: profile._id });
    if (!service) return sendError(res, 'Service not found or unauthorized.', 404);

    const { title, description, category, price, priceType, estimatedValue, estimatedUnit, isAvailable, status } = req.body;

    if (title) service.title = title;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price !== undefined) service.price = parseFloat(price);
    if (priceType) service.priceType = priceType;
    if (estimatedValue) service.estimatedTime.value = estimatedValue;
    if (estimatedUnit) service.estimatedTime.unit = estimatedUnit;
    if (isAvailable !== undefined) service.isAvailable = isAvailable !== 'false' && isAvailable !== false;
    if (status) service.status = status;

    if (req.files && req.files.length > 0) {
      for (const img of service.images) {
        await deleteFromCloudinary(img.public_id);
      }
      service.images = [];
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'hunarhub/services');
        service.images.push(uploaded);
      }
    }

    await service.save();
    await service.populate('category', 'name icon');
    return sendSuccess(res, 'Service updated.', { service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Entrepreneur
const deleteService = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    const service = await Service.findOne({ _id: req.params.id, entrepreneur: profile._id });
    if (!service) return sendError(res, 'Service not found or unauthorized.', 404);

    for (const img of service.images) {
      await deleteFromCloudinary(img.public_id);
    }
    await service.deleteOne();
    return sendSuccess(res, 'Service deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServiceById, getMyServices, createService, updateService, deleteService };
