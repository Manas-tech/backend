import express from 'express';
import { uploadAvatar, deleteAvatar } from '../controllers/uploadController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Upload avatar image (authenticated users)
router.post('/avatar', authenticateToken, uploadAvatar);

// Delete avatar image (authenticated users)
router.delete('/avatar/:filename', authenticateToken, deleteAvatar);

export default router;