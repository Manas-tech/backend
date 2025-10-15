import express from 'express';
import { 
  getUserOnboarding,
  createUserOnboarding,
  updateUserOnboarding,
  deleteUserOnboarding,
  getAllOnboarding
} from '../controllers/onboardingController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/:userId', getUserOnboarding);
router.post('/', createUserOnboarding);
router.put('/:userId', updateUserOnboarding);
router.delete('/:userId', deleteUserOnboarding);

// Admin only routes
router.get('/', requireAdmin, getAllOnboarding);

export default router;