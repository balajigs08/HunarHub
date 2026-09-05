const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.get('/my-orders', authenticate, getOrders);
router.get('/entrepreneur-orders', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, authorize('customer'), createOrder);
router.put('/:id/status', authenticate, authorize('entrepreneur', 'admin'), updateOrderStatus);
router.put('/:id/cancel', authenticate, authorize('customer'), cancelOrder);

module.exports = router;
