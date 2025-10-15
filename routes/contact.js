import express from 'express';
import { 
  getAllContactSubmissions,
  getContactSubmissionById,
  createContactSubmission,
  updateContactSubmission,
  deleteContactSubmission,
  getContactStats,
  getUserServiceConsumption,
  getServicesByCategory,
  getContactInfo,
  updateContactInfo
} from '../controllers/contactController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/submissions', validateRequest(schemas.contact), createContactSubmission);
router.get('/contact-info', getContactInfo);


// Protected routes
router.use(authenticateToken);

// User routes
router.get('/consumption/user/:userId', getUserServiceConsumption);
router.get('/consumption/category/:category', getServicesByCategory);

// Admin only routes
router.get('/submissions', requireAdmin, getAllContactSubmissions);
router.get('/submissions/stats', requireAdmin, getContactStats);
router.get('/submissions/:id', requireAdmin, getContactSubmissionById);
router.put('/submissions/:id', requireAdmin, updateContactSubmission);
router.delete('/submissions/:id', requireAdmin, deleteContactSubmission);

// Contact Information Management (Admin only)
router.get('/admin/contact-info', requireAdmin, getContactInfo);
router.put('/admin/contact-info', requireAdmin, updateContactInfo);


export default router;