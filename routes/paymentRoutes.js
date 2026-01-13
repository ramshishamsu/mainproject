import express from "express";
import { createCheckoutSession, razorpayWebhook, getUserPayments } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Razorpay order creation
router.post("/checkout", protect, createCheckoutSession);

// Get user payments
router.get("/", protect, getUserPayments);

// Razorpay webhook (RAW body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
