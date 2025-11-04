import express from "express";
import { protect } from '../middleware/authmiddleware.js';
import {
  scheduleViewing,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointmentsForPropertyOwner,
  cancelAppointment,
  updateAppointmentMeetingLink,
  getAppointmentStats,
  submitAppointmentFeedback,
  getUpcomingAppointments,
  countPendingAppointments
} from "../controller/appointmentController.js";


const router = express.Router();

// User routes
router.post("/schedule", protect, scheduleViewing);  // Add protect middleware
router.get("/user", protect, getAppointmentsForPropertyOwner);
router.put("/cancel/:id", protect, cancelAppointment);
router.put("/feedback/:id", protect, submitAppointmentFeedback);
router.get("/upcoming", protect, getUpcomingAppointments);
router.post("/count-pending", protect, countPendingAppointments);

// Admin routes
router.get("/all", protect, getAllAppointments);
router.get("/stats", protect, getAppointmentStats);
router.put("/status", protect, updateAppointmentStatus);
router.put("/update-meeting", protect, updateAppointmentMeetingLink);

export default router;