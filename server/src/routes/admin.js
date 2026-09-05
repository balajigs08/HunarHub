const express = require('express');
const router = express.Router();
const {
  getDashboard, getAnalytics,
  getAdminEntrepreneurs, approveEntrepreneur, rejectEntrepreneur, suspendEntrepreneur, reactivateEntrepreneur,
  getAdminProducts, toggleProductStatus,
} = require('../controllers/adminController');
const { getOrders } = require('../controllers/orderController');
const { getServiceRequests } = require('../controllers/serviceRequestController');
const { getComplaints, updateComplaint } = require('../controllers/complaintController');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getAllUsers } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const adminMiddleware = [authenticate, authorize('admin')];

router.get('/dashboard', ...adminMiddleware, getDashboard);
router.get('/analytics', ...adminMiddleware, getAnalytics);

// Users
router.get('/users', ...adminMiddleware, getAllUsers);

// Entrepreneurs
router.get('/entrepreneurs', ...adminMiddleware, getAdminEntrepreneurs);
router.get('/entrepreneurs/pending', ...adminMiddleware, (req, res, next) => {
  req.query.verificationStatus = 'pending';
  next();
}, getAdminEntrepreneurs);
router.put('/entrepreneurs/:id/approve', ...adminMiddleware, approveEntrepreneur);
router.put('/entrepreneurs/:id/reject', ...adminMiddleware, rejectEntrepreneur);
router.put('/entrepreneurs/:id/suspend', ...adminMiddleware, suspendEntrepreneur);
router.put('/entrepreneurs/:id/reactivate', ...adminMiddleware, reactivateEntrepreneur);

// Products
router.get('/products', ...adminMiddleware, getAdminProducts);
router.put('/products/:id/toggle', ...adminMiddleware, toggleProductStatus);

// Orders
router.get('/orders', ...adminMiddleware, getOrders);

// Service requests
router.get('/service-requests', ...adminMiddleware, getServiceRequests);

// Complaints
router.get('/complaints', ...adminMiddleware, getComplaints);
router.put('/complaints/:id', ...adminMiddleware, updateComplaint);

// Categories
router.get('/categories', ...adminMiddleware, (req, res, next) => {
  req.query.includeInactive = 'true';
  next();
}, getCategories);
router.post('/categories', ...adminMiddleware, createCategory);
router.put('/categories/:id', ...adminMiddleware, updateCategory);
router.delete('/categories/:id', ...adminMiddleware, deleteCategory);

module.exports = router;
