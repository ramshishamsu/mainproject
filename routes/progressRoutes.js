import express from "express";
import { addProgress, getProgress } from "../controllers/progressController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkPayment } from "../middlewares/checkpaymentMiddleware.js";

const router = express.Router();

router.post("/", protect, checkPayment, addProgress);
// Allow trainers/admins to fetch progress for a user (no payment check required)
router.get("/", protect, getProgress);

export default router;
