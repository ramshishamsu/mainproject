import express from "express";
import {
  registerTrainer,
  getTrainers,
  getTrainerProfile,
  updateTrainerProfile,
  getTrainerEarnings,
  approveTrainer,
  getTrainerUsers
} from "../controllers/trainerController.js";

import { protect, isTrainer, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/* TRAINER REGISTER */
router.post(
  "/register",
  upload.single("profileImage"),
  registerTrainer
);

/* GET APPROVED TRAINERS */
router.get("/", getTrainers);

/* TRAINER PROFILE */
router.get("/profile", protect, isTrainer, getTrainerProfile);

router.put(
  "/profile",
  protect,
  isTrainer,
  upload.single("profileImage"),
  updateTrainerProfile
);

/* TRAINER EARNINGS */
router.get("/earnings", protect, isTrainer, getTrainerEarnings);

/* TRAINER USERS */
router.get("/users", protect, isTrainer, getTrainerUsers);

/* ADMIN APPROVE TRAINER */
router.put("/:id/approve", protect, adminOnly, approveTrainer);



export default router;
