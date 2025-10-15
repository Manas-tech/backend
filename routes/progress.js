import express from 'express';
import { 
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  updateCurrentPhaseSubstep,
  updateMilestone,
  getAllUserProgress,
  deleteUserProgress
} from '../controllers/progressController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/:userId', getUserProgress);
router.post('/', createUserProgress);
router.put('/:userId', updateUserProgress);
router.put('/:userId/phase-substep', updateCurrentPhaseSubstep);
router.put('/:userId/milestone', updateMilestone);
router.delete('/:userId', deleteUserProgress);

// Admin only routes
router.get('/', requireAdmin, getAllUserProgress);

export default router;