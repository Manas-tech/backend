import express from 'express';
import { 
  getAllPortfolio, 
  getPortfolioById, 
  getPortfolioBySlug,
  createPortfolio, 
  updatePortfolio, 
  deletePortfolio 
} from '../controllers/portfolioController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllPortfolio);
router.get('/:id', getPortfolioById);
router.get('/slug/:slug', getPortfolioBySlug);

// Protected routes
router.use(authenticateToken);

// Admin only routes
router.post('/', requireAdmin, validateRequest(schemas.portfolio), createPortfolio);
router.put('/:id', requireAdmin, validateRequest(schemas.portfolio), updatePortfolio);
router.delete('/:id', requireAdmin, deletePortfolio);

export default router;