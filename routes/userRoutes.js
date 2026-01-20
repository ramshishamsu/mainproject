import express from "express";
import { getProfile, updateProfile, getUserProfileForTrainer, getAllUsers, updateUserStatus } from "../controllers/userController.js";
import { protect, isTrainer, isAdmin, isTrainerOrAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Trainer/Admin routes
router.get(
  "/:id",
  protect,
  isTrainer,
  getUserProfileForTrainer
);

// Get all users (for trainers and admins)
router.get(
  "/",
  protect,
  isTrainerOrAdmin,
  getAllUsers
);

// Update user status (for admins only)
router.put(
  "/:id/status",
  protect,
  isAdmin,
  updateUserStatus
);

export default router;
