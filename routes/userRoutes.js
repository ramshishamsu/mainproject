import express from "express";
import { getProfile, updateProfile, getUserProfileForTrainer, getAllUsers, updateUserStatus, blockUnblockUser, getUserSubscription, getUserPayments, getUserWorkouts, getUserGoals, getUserProgress, getUserNutritionLogs } from "../controllers/userController.js";
import { protect, isTrainer, isAdmin, isTrainerOrAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

router.get('/my-subscription', protect, getUserSubscription);

// User specific data routes
router.get('/payments', protect, getUserPayments);
router.get('/workouts', protect, getUserWorkouts);
router.get('/goals', protect, getUserGoals);
router.get('/progress', protect, getUserProgress);
router.get('/nutrition-logs', protect, getUserNutritionLogs);

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

// Block/Unblock user (for admins only)
router.put(
  "/:id/block",
  protect,
  isAdmin,
  blockUnblockUser
);

export default router;
