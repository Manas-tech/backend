import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(schemas.register), register);
router.post('/login', validateRequest(schemas.login), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateRequest(schemas.userUpdate), updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;

