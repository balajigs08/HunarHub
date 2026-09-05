const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/helpers');
const { createNotification } = require('../services/notificationService');

// @desc    Get customer orders
// @route   GET /api/orders
// @access  Customer / Entrepreneur / Admin
const getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
      if (!profile) return sendError(res, 'Profile not found.', 404);
      query['items.entrepreneur'] = profile._id;
    }
    // Admin sees all

    if (status) query.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('items.product', 'name images price')
        .populate('items.entrepreneur', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return sendPaginated(res, 'Orders retrieved.', orders, getPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Customer / Entrepreneur / Admin
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate({
        path: 'items.product',
        select: 'name images price description',
        populate: { path: 'entrepreneur', select: 'businessName' },
      })
      .populate('items.entrepreneur', 'businessName location');

    if (!order) return sendError(res, 'Order not found.', 404);

    // Authorization check
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to view this order.', 403);
    }
    if (req.user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
      const hasItem = order.items.some((i) => i.entrepreneur && i.entrepreneur._id.toString() === profile._id.toString());
      if (!hasItem) return sendError(res, 'Not authorized to view this order.', 403);
    }

    return sendSuccess(res, 'Order retrieved.', { order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Customer
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cash', notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Your cart is empty.', 400);
    }

    // Validate stock for each item
    for (const item of cart.items) {
      if (!item.product) return sendError(res, 'Some products in cart no longer exist.', 400);
      if (item.product.status !== 'active' || !item.product.isAvailable) {
        return sendError(res, `Product "${item.product.name}" is no longer available.`, 400);
      }
      if (item.product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available.`, 400);
      }
    }

    // Prepare order items with entrepreneur info
    const orderItems = [];
    let totalAmount = 0;
    const entrepreneursToNotify = new Set();

    for (const item of cart.items) {
      const entrepreneurProfile = await EntrepreneurProfile.findById(item.product.entrepreneur);
      orderItems.push({
        product: item.product._id,
        entrepreneur: item.product.entrepreneur,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: typeof item.product.images[0] === 'string'
          ? item.product.images[0]
          : item.product.images[0]?.url || '',
      });
      totalAmount += item.product.price * item.quantity;
      if (entrepreneurProfile) {
        entrepreneursToNotify.add(entrepreneurProfile.user.toString());
      }
    }

    // Create order
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, totalSold: item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Notify entrepreneurs
    for (const entrepreneurUserId of entrepreneursToNotify) {
      await createNotification({
        recipient: entrepreneurUserId,
        type: 'order_placed',
        title: 'New Order Received!',
        message: `You have received a new order from ${req.user.name}.`,
        data: { orderId: order._id },
        link: `/entrepreneur/orders/${order._id}`,
      });
    }

    await order.populate('customer', 'name email');
    return sendSuccess(res, 'Order placed successfully!', { order }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Entrepreneur / Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('items.entrepreneur', 'businessName user');

    if (!order) return sendError(res, 'Order not found.', 404);

    // Validate entrepreneur ownership
    if (req.user.role === 'entrepreneur') {
      const profile = await EntrepreneurProfile.findOne({ user: req.user._id });
      const hasItem = order.items.some((i) => i.entrepreneur && i.entrepreneur._id.toString() === profile._id.toString());
      if (!hasItem) return sendError(res, 'Not authorized.', 403);
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      return sendError(res, `Cannot transition from "${order.orderStatus}" to "${status}".`, 400);
    }

    // Handle cancellation - restore stock
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, totalSold: -item.quantity },
        });
      }
      order.cancelledAt = new Date();
    }

    if (status === 'completed') {
      order.completedAt = new Date();
      // Update entrepreneur earnings
      for (const item of order.items) {
        if (item.entrepreneur) {
          await EntrepreneurProfile.findByIdAndUpdate(item.entrepreneur._id, {
            $inc: { totalEarnings: item.price * item.quantity },
          });
        }
      }
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, changedBy: req.user._id, note });
    await order.save();

    // Notify customer
    await createNotification({
      recipient: order.customer._id,
      type: 'order_status_changed',
      title: 'Order Status Updated',
      message: `Your order status has been updated to "${status}".`,
      data: { orderId: order._id },
      link: `/customer/orders/${order._id}`,
    });

    return sendSuccess(res, 'Order status updated.', { order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Customer
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return sendError(res, 'Order not found.', 404);

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return sendError(res, 'Order cannot be cancelled at this stage.', 400);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity },
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: 'cancelled', changedBy: req.user._id, note: 'Cancelled by customer' });
    await order.save();

    return sendSuccess(res, 'Order cancelled successfully.', { order });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
