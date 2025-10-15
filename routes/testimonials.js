import express from 'express';
import { 
  getAllTestimonials, 
  getTestimonialById, 
  getFeaturedTestimonials,
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  getTestimonialStats
} from '../controllers/testimonialController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedTestimonials);

// All other routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, getAllTestimonials);
router.get('/stats', requireAdmin, getTestimonialStats);
router.get('/:id', requireAdmin, getTestimonialById);
router.post('/', requireAdmin, createTestimonial);
router.put('/:id', requireAdmin, updateTestimonial);
router.delete('/:id', requireAdmin, deleteTestimonial);

export default router;
