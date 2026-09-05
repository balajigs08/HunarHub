const Product = require('../models/Product');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all active products (public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { category, minPrice, maxPrice, search, condition, entrepreneurId, sort } = req.query;

    const query = { status: 'active', isAvailable: true, stock: { $gt: 0 } };

    if (category) {
      const mongoose = require('mongoose');
      const Category = require('../models/Category');
      const rawCatStr = decodeURIComponent(category).trim();

      let catDoc = null;
      if (mongoose.Types.ObjectId.isValid(rawCatStr)) {
        catDoc = await Category.findById(rawCatStr);
      }

      if (!catDoc) {
        catDoc = await Category.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${rawCatStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
            { slug: rawCatStr.toLowerCase().replace(/\s+/g, '-') },
            { name: { $regex: rawCatStr, $options: 'i' } }
          ]
        });
      }

      if (catDoc) {
        query.category = catDoc._id;
      } else {
        query.category = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    }

    if (entrepreneurId) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(entrepreneurId)) {
        const entProf = await EntrepreneurProfile.findOne({ $or: [{ _id: entrepreneurId }, { user: entrepreneurId }] });
        if (entProf) {
          query.entrepreneur = entProf._id;
        } else {
          query.entrepreneur = entrepreneurId;
        }
      } else {
        query.entrepreneur = entrepreneurId;
      }
    }
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { totalSold: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate({
          path: 'entrepreneur',
          select: 'businessName location profileImage averageRating verificationStatus',
          populate: { path: 'user', select: 'name avatar' },
        })
        .populate('category', 'name icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return sendPaginated(res, 'Products retrieved.', products, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'entrepreneur',
        select: 'businessName location profileImage averageRating totalReviews verificationStatus availability',
        populate: [{ path: 'user', select: 'name avatar' }, { path: 'category', select: 'name' }],
      })
      .populate('category', 'name icon');
    if (!product) return sendError(res, 'Product not found.', 404);
    return sendSuccess(res, 'Product retrieved.', { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my products
// @route   GET /api/products/my
// @access  Entrepreneur
const getMyProducts = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Profile not found.', 404);

    const products = await Product.find({ entrepreneur: profile._id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Products retrieved.', { products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Entrepreneur
const createProduct = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    if (!profile) return sendError(res, 'Entrepreneur profile not found.', 404);

    const { name, description, category, price, stock, condition, location, tags } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'hunarhub/products');
        images.push(uploaded);
      }
    }

    const product = await Product.create({
      entrepreneur: profile._id,
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      condition: condition || 'handmade',
      location,
      images,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    });

    await product.populate('category', 'name icon');
    return sendSuccess(res, 'Product created.', { product }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Entrepreneur
const updateProduct = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, entrepreneur: profile._id });
    if (!product) return sendError(res, 'Product not found or unauthorized.', 404);

    const { name, description, category, price, stock, condition, location, isAvailable, status, tags } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (condition) product.condition = condition;
    if (location) product.location = location;
    if (isAvailable !== undefined) product.isAvailable = isAvailable !== 'false' && isAvailable !== false;
    if (status) product.status = status;
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());

    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        await deleteFromCloudinary(img.public_id);
      }
      product.images = [];
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, 'hunarhub/products');
        product.images.push(uploaded);
      }
    }

    await product.save();
    await product.populate('category', 'name icon');
    return sendSuccess(res, 'Product updated.', { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Entrepreneur
const deleteProduct = async (req, res, next) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, entrepreneur: profile._id });
    if (!product) return sendError(res, 'Product not found or unauthorized.', 404);

    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }
    await product.deleteOne();
    return sendSuccess(res, 'Product deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct };
