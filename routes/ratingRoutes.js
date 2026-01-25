import express from "express";
import {
  createRating,
  getMyRatings,
  createFeedback,
  getMyFeedback
} from "../controllers/ratingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Rating routes
router.post("/", createRating);
router.get("/my", getMyRatings);

// Feedback routes
router.post("/", createFeedback);
router.get("/my", getMyFeedback);

export default router;
