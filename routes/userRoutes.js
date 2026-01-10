import express from "express";
import { getProfile, updateProfile, getUserProfileForTrainer } from "../controllers/userController.js";
import { protect,isTrainer } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get(
  "/:id",
  protect,
  isTrainer,
  getUserProfileForTrainer
);


export default router;
