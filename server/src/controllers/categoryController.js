const Category = require('../models/Category');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const query = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ name: 1 });

    // Get entrepreneur count per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await EntrepreneurProfile.countDocuments({
          category: cat._id,
          verificationStatus: 'approved',
        });
        return { ...cat.toObject(), entrepreneurCount: count };
      })
    );

    return sendSuccess(res, 'Categories retrieved.', { categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return sendError(res, 'Category not found.', 404);
    return sendSuccess(res, 'Category retrieved.', { category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (admin)
// @route   POST /api/admin/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return sendError(res, 'Category with this name already exists.', 409);

    const category = await Category.create({ name, description, icon });
    return sendSuccess(res, 'Category created.', { category }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/admin/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );
    if (!category) return sendError(res, 'Category not found.', 404);
    return sendSuccess(res, 'Category updated.', { category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/admin/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const count = await EntrepreneurProfile.countDocuments({ category: req.params.id });
    if (count > 0) {
      return sendError(res, `Cannot delete category. ${count} entrepreneur(s) are using it. Deactivate instead.`, 400);
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return sendError(res, 'Category not found.', 404);
    return sendSuccess(res, 'Category deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
