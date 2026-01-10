import express from "express";
import { addProgress, getProgress } from "../controllers/progressController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkPayment } from "../middlewares/checkpaymentMiddleware.js";

const router = express.Router();

router.post("/", protect, checkPayment, addProgress);
router.get("/", protect, checkPayment, getProgress);

export default router;
