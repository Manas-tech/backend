import express from 'express';
import { 
  getUserProjects,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMilestone,
  updateMilestone,
  getProjectStats
} from '../controllers/projectController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// User routes (authenticated)
router.get('/user/:userId', authenticateToken, getUserProjects);
router.get('/user/:userId/stats', authenticateToken, getProjectStats);
router.get('/:id', authenticateToken, getProjectById);
router.post('/', authenticateToken, validateRequest(schemas.project), createProject);
router.put('/:id', authenticateToken, updateProject);
router.delete('/:id', authenticateToken, deleteProject);

// Milestone routes
router.post('/:id/milestones', authenticateToken, validateRequest(schemas.milestone), addMilestone);
router.put('/:id/milestones/:milestoneId', authenticateToken, updateMilestone);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllProjects);

export default router;
