import express from 'express';
import { 
  getAllServiceConsumption, 
  getServiceConsumptionById, 
  getUserServiceConsumption,
  createServiceConsumption, 
  updateServiceConsumption, 
  deleteServiceConsumption,
  getServiceConsumptionStats
} from '../controllers/serviceConsumptionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/user/:userId', getUserServiceConsumption);

// Admin only routes
router.get('/', requireAdmin, getAllServiceConsumption);
router.get('/stats', requireAdmin, getServiceConsumptionStats);
router.get('/:id', requireAdmin, getServiceConsumptionById);
router.post('/', requireAdmin, createServiceConsumption);
router.put('/:id', requireAdmin, updateServiceConsumption);
router.delete('/:id', requireAdmin, deleteServiceConsumption);

export default router;
