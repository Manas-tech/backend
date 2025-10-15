import express from 'express';
import { 
  getAllPurchases, 
  getPurchaseById, 
  getUserPurchases,
  createPurchase, 
  updatePurchase, 
  deletePurchase 
} from '../controllers/purchaseController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/user/:userId', getUserPurchases);

// Admin only routes
router.get('/', requireAdmin, getAllPurchases);
router.get('/:id', requireAdmin, getPurchaseById);
router.post('/', requireAdmin, createPurchase);
router.put('/:id', requireAdmin, updatePurchase);
router.delete('/:id', requireAdmin, deletePurchase);

export default router;