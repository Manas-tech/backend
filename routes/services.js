import express from 'express';
import { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} from '../controllers/serviceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post('/', requireAdmin, createService);
router.put('/:id', requireAdmin, updateService);
router.delete('/:id', requireAdmin, deleteService);

export default router;