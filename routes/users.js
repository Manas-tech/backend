import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUsersLastUpdated
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.get('/stats', requireAdmin, getUserStats);
router.get('/last-updated', requireAdmin, getUsersLastUpdated);
router.get('/:id', requireAdmin, getUserById);
router.put('/:id', requireAdmin, validateRequest(schemas.userUpdate), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;

