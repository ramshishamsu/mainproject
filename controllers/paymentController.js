import Razorpay from "razorpay";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import crypto from "crypto-js";

/*
|--------------------------------------------------------------------------
| RAZORPAY INSTANCE
|--------------------------------------------------------------------------
*/

let razorpay;

const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env");
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
*/

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("=== RAZORPAY PAYMENT DEBUG START ===");
    console.log("Request body:", req.body);
    console.log("User from middleware:", req.user);
    
    const razorpay = getRazorpay();
    const { planId } = req.body;

    // ✅ Logged-in user (from protect middleware)
    const userId = req.user._id.toString();
    console.log("User ID:", userId);
    console.log("Plan ID:", planId);

    const plan = await Plan.findById(planId);
    console.log("Plan found:", plan ? "Yes" : "No");
    if (plan) {
      console.log("Plan details:", { name: plan.name, price: plan.price, type: typeof plan.price });
    }
    
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const price = Number(plan.price);
    console.log("Processed price:", price, "Type:", typeof price);
    
    if (!price || isNaN(price)) {
      return res.status(400).json({ message: "Invalid plan price" });
    }

    console.log("Creating Razorpay order...");
    const options = {
      amount: Math.round(price * 100), // Razorpay uses paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `rcpt_${userId.toString().slice(-6)}_${Date.now().toString().slice(-4)}`,
      notes: {
        userId: userId,
        planId: plan._id.toString(),
        planName: plan.name
      }
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);

    res.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      notes: order.notes
    });

  } catch (error) {
    console.error("Razorpay order error:", error.message);
    console.error("Full error:", error);
    console.error("Plan ID:", req.body.planId);
    console.error("User ID:", req.user?._id);
    console.error("Razorpay keys exist:", !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET));
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER PAYMENTS
|--------------------------------------------------------------------------
| Returns all payments for the logged-in user
*/
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| RAZORPAY WEBHOOK
|--------------------------------------------------------------------------
*/

export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).json({ message: "Missing signature" });
    }

    // Verify webhook signature using crypto-js
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .HmacSHA256(body, webhookSecret)
      .toString(crypto.enc.Hex);

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    console.log("Razorpay webhook event:", event);

    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      
      // Get plan details from payment notes
      const planId = payment.notes?.planId;
      const userId = payment.notes?.userId;
      
      if (!planId || !userId) {
        console.error('Missing planId or userId in payment notes');
        return res.json({ received: true });
      }

      const plan = await Plan.findById(planId);
      if (!plan) {
        console.error('Plan not found for subscription activation');
        return res.json({ received: true });
      }

      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);

      // Create payment record
      await Payment.create({
        userId: userId,
        amount: payment.amount / 100, // Convert paise to INR
        paymentMethod: "razorpay",
        paymentStatus: "success",
        transactionId: payment.id
      });

      // Activate subscription
      await User.findByIdAndUpdate(userId, {
        "subscription.plan": planId,
        "subscription.status": "active",
        "subscription.startDate": startDate,
        "subscription.endDate": endDate
      });

      console.log(`Subscription activated for user ${userId} until ${endDate}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};
