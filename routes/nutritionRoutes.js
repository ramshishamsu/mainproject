import express from "express";
import { addNutrition, getMyNutrition } from "../controllers/nutritionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { checkPayment } from "../middlewares/checkpaymentMiddleware.js";

const router = express.Router();

router.post("/", protect, checkPayment, addNutrition);
router.get("/", protect, checkPayment, getMyNutrition);

export default router;
