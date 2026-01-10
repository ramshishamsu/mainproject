import express from "express";
import { addReview } from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| USER REVIEWS TRAINER
|--------------------------------------------------------------------------
*/
router.post("/:trainerId", protect, addReview);

export default router;
