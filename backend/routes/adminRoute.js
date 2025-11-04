import express from 'express';
import { 
  getAdminStats,
  getAllUsers,
  getAllProperties,
  getAllAppointments,
  updateAppointmentStatus,
  deleteProperty,
  deleteUser,
  getAllReports,
  updateReportStatus,
  getSystemHealth
} from '../controller/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', adminMiddleware, getAdminStats);

// User management
router.get('/users', adminMiddleware, getAllUsers);
router.delete('/users/:id', adminMiddleware, deleteUser);

// Property management
router.get('/properties', adminMiddleware, getAllProperties);
router.delete('/properties/:id', adminMiddleware, deleteProperty);

// Appointment management
router.get('/appointments', adminMiddleware, getAllAppointments);
router.put('/appointments/status', adminMiddleware, updateAppointmentStatus);

// Report management
router.get('/reports', adminMiddleware, getAllReports);
router.put('/reports/:id/status', adminMiddleware, updateReportStatus);

// System health
router.get('/health', adminMiddleware, getSystemHealth);

export default router;