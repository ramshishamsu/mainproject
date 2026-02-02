import express from "express";
import { createCheckoutSession, razorpayWebhook, getUserPayments, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const router = express.Router();

// Razorpay order creation
router.post("/checkout", protect, createCheckoutSession);

// Verify payment (fallback to webhook)
router.post("/verify", protect, verifyPayment);

// Get user payments
router.get("/", protect, getUserPayments);

// Manual payment activation (temporary fix)
router.post("/manual-activate", protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    console.log("Manual activation request:", { planId, userId });

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    // Create payment record
    const payment = await Payment.create({
      userId: userId,
      amount: plan.price,
      paymentMethod: "razorpay",
      paymentStatus: "success",
      transactionId: `manual_${Date.now()}`
    });

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      "subscription.plan": planId,
      "subscription.status": "active",
      "subscription.startDate": startDate,
      "subscription.endDate": endDate
    });

    console.log(`Manual subscription activated for user ${userId} until ${endDate}`);

    res.json({
      success: true,
      message: "Subscription activated successfully",
      payment: payment
    });

  } catch (error) {
    console.error("Manual activation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Razorpay webhook (RAW body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
