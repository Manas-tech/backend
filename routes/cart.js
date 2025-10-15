import express from 'express';
import { body, param } from 'express-validator';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
  getCartSummary
} from '../controllers/cartController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateAddToCart = [
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').notEmpty().withMessage('Amount is required'),
  body('icon').notEmpty().withMessage('Icon is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('serviceType').isIn(['individual', 'package']).withMessage('Service type must be individual or package'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
];

const validateUpdateQuantity = [
  param('serviceId').notEmpty().withMessage('Service ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

// All cart routes require authentication
router.use(auth);

// GET /api/cart/summary - Get cart summary (item count and total) - Must be before GET /
router.get('/summary', getCartSummary);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart - Add item to cart
router.post('/', validateAddToCart, addToCart);

// PUT /api/cart/:serviceId - Update item quantity
router.put('/:serviceId', validateUpdateQuantity, updateItemQuantity);

// DELETE /api/cart/:serviceId - Remove item from cart
router.delete('/:serviceId', removeFromCart);

// DELETE /api/cart/clear - Clear entire cart (changed route to avoid conflict)
router.delete('/clear', clearCart);

export default router;
