import express from "express";
import {
  registerTrainer,
  getTrainers,
  getTrainerProfile,
  updateTrainerProfile,
  getTrainerEarnings,
  approveTrainer,
  getTrainerUsers,
  getTrainerClients,
  uploadVerificationDoc,
  getAssignedTrainer,
   updateProfileImage  
} from "../controllers/trainerController.js";

import { protect, isTrainer, adminOnly, trainerApprovedOnly } from "../middlewares/authMiddleware.js";
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

/* GET ASSIGNED TRAINER FOR USER */
router.get("/assigned-trainer", protect, getAssignedTrainer);  // ADD THIS

/* TRAINER PROFILE */
router.get("/profile", protect, isTrainer, getTrainerProfile);

router.put(
  "/profile",
  protect,
  isTrainer,
  upload.single("profileImage"),
  updateTrainerProfile
);
/* UPDATE PROFILE IMAGE */
router.put("/profile-image", protect, isTrainer, updateProfileImage);
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

/* TRAINER CLIENTS */
// Return trainer's assigned clients (route: GET /api/trainers/clients)
router.get("/clients", protect, isTrainer, getTrainerClients);

/* TEST ENDPOINT */
router.get("/test", (req, res) => {
  res.json({ message: "Trainer routes working!" });
});

/* ADMIN APPROVE TRAINER */
router.put("/:id/approve", protect, adminOnly, approveTrainer);



export default router;
