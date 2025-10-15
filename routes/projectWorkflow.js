import express from 'express';
import {
  getUserProjects,
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectPhase,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addDeliverable,
  addCommunication,
  getProjectStatistics,
  toggleProjectSubstep
} from '../controllers/projectWorkflowController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.get('/user/:userId', getUserProjects);
router.get('/stats', requireAdmin, getProjectStatistics);
router.get('/', requireAdmin, getAllProjects);
router.get('/:projectId', getProject);
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

// Project phase management
router.put('/:projectId/phase', updateProjectPhase);

// Substep management
router.put('/:projectId/substeps', toggleProjectSubstep);

// Milestone management
router.post('/:projectId/milestones', addMilestone);
router.put('/:projectId/milestones/:milestoneId', updateMilestone);
router.delete('/:projectId/milestones/:milestoneId', deleteMilestone);

// Deliverable management
router.post('/:projectId/deliverables', addDeliverable);

// Communication management
router.post('/:projectId/communications', addCommunication);

export default router;
