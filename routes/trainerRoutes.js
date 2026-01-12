import express from "express";
import {
  registerTrainer,
  getTrainers,
  getTrainerProfile,
  updateTrainerProfile,
  getTrainerEarnings,
  approveTrainer,
  getTrainerUsers,
  uploadVerificationDoc
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

/* UPLOAD VERIFICATION DOCUMENT */
router.post(
  "/verify",
  protect,
  isTrainer,
  upload.single("document"),
  uploadVerificationDoc
);


/* TRAINER EARNINGS */
router.get("/earnings", protect, isTrainer, getTrainerEarnings);

/* TRAINER USERS */
// Return trainer's clients (route: GET /api/trainers/users)
router.get("/users", protect, isTrainer, getTrainerUsers);

/* ADMIN APPROVE TRAINER */
router.put("/:id/approve", protect, adminOnly, approveTrainer);



export default router;
