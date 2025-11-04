import express from 'express';
import { createReport, getUserReports, getAllReports, updateReportStatus } from '../controller/reportController.js';
import { protect } from '../middleware/authmiddleware.js';

const reportRouter = express.Router();

// User routes
reportRouter.post('/create', protect, createReport);
reportRouter.get('/my-reports', protect, getUserReports);

// Admin routes (for future admin panel)
reportRouter.get('/admin/all', protect, getAllReports);
reportRouter.put('/admin/:id/status', protect, updateReportStatus);

export default reportRouter;