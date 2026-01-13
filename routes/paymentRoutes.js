import express from "express";
import { createCheckoutSession, stripeWebhook, getUserPayments } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Stripe checkout
router.post("/checkout", protect, createCheckoutSession);

// Get user payments
router.get("/", protect, getUserPayments);

// Stripe webhook (RAW body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
