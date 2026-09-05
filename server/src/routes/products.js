const express = require('express');
const router = express.Router();
// Product routes definition
const {
  getProducts, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/my', authenticate, authorize('entrepreneur'), getMyProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('entrepreneur'), upload.array('images', 5), createProduct);
router.put('/:id', authenticate, authorize('entrepreneur'), upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, authorize('entrepreneur'), deleteProduct);

module.exports = router;
