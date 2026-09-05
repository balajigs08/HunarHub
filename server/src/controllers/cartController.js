const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get cart
// @route   GET /api/cart
// @access  Customer
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isAvailable status entrepreneur',
        populate: {
          path: 'entrepreneur',
          select: 'businessName',
          populate: { path: 'user', select: 'name' },
        },
      });

    if (!cart) {
      return sendSuccess(res, 'Cart retrieved.', { cart: { items: [], totalAmount: 0, totalQuantity: 0 } });
    }

    return sendSuccess(res, 'Cart retrieved.', { cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Customer
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 'Product not found.', 404);
    if (product.status !== 'active' || !product.isAvailable) {
      return sendError(res, 'Product is not available.', 400);
    }
    if (product.stock < quantity) {
      return sendError(res, `Only ${product.stock} items available in stock.`, 400);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      if (newQuantity > product.stock) {
        return sendError(res, `Only ${product.stock} items available in stock.`, 400);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity), price: product.price });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isAvailable status',
    });

    return sendSuccess(res, 'Item added to cart.', { cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Customer
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 'Cart not found.', 404);

    const item = cart.items.id(req.params.itemId);
    if (!item) return sendError(res, 'Cart item not found.', 404);

    const product = await Product.findById(item.product);
    if (parseInt(quantity) > product.stock) {
      return sendError(res, `Only ${product.stock} items available in stock.`, 400);
    }

    if (parseInt(quantity) <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = parseInt(quantity);
    }

    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name price images stock isAvailable status' });
    return sendSuccess(res, 'Cart updated.', { cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Customer
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 'Cart not found.', 404);

    cart.items.pull(req.params.itemId);
    await cart.save();
    return sendSuccess(res, 'Item removed from cart.', { cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Customer
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    return sendSuccess(res, 'Cart cleared.');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
