import express from 'express';
import { 
  getAllBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  incrementViewCount 
} from '../controllers/blogController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.put('/:id/view', incrementViewCount);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post('/', requireAdmin, validateRequest(schemas.blog), createBlog);
router.put('/:id', requireAdmin, validateRequest(schemas.blog), updateBlog);
router.delete('/:id', requireAdmin, deleteBlog);

export default router;

