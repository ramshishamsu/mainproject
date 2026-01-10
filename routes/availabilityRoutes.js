import express from "express";
import {
  createAvailability,
  getAvailabilityByTrainer
} from "../controllers/availabilityController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Trainer adds availability
router.post("/", protect, createAvailability);

// User views trainer availability
router.get("/:trainerId", getAvailabilityByTrainer);

export default router;
