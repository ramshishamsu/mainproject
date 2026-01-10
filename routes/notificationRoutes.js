import express from "express";
import { getNotifications } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get logged-in user's notifications
router.get("/", protect, getNotifications);

export default router;
