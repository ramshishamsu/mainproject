import express from "express";
import {
  createAppointment,
  getMyAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment
} from "../controllers/appointmentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createAppointment);
router.get("/", protect, getMyAppointments);
router.put("/:id/approve", protect, adminOnly, approveAppointment);
router.put("/:id/reject", protect, adminOnly, rejectAppointment);
router.put("/:id/complete", protect, completeAppointment);

export default router;
