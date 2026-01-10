import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";

/*
|--------------------------------------------------------------------------
| LAZY STRIPE INITIALIZATION
|--------------------------------------------------------------------------
*/
let stripe;

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

/*
|--------------------------------------------------------------------------
| STRIPE WEBHOOK HANDLER
|--------------------------------------------------------------------------
*/
export const stripeWebhook = async (req, res) => {
  

  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Event type:", event.type);

  try {
    if (event.type === "checkout.session.completed") {

      const session = event.data.object;

      const userId = session.metadata.userId;
      const planId = session.metadata.planId;
      const transactionId = session.payment_intent;

      console.log("🧾 User:", userId);
      console.log("📦 Plan:", planId);

      // 1️⃣ Get plan
      const plan = await Plan.findById(planId);
      if (!plan) {
        console.error("❌ Plan not found");
        return res.status(404).end();
      }

      // 2️⃣ Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      // 3️⃣ Create / update subscription
      const subscription = await Subscription.findOneAndUpdate(
        { userId },
        {
          userId,
          planId,
          startDate,
          endDate,
          status: "active",
        },
        { upsert: true, new: true }
      );

      console.log("✅ Subscription updated:", subscription._id);

      // 4️⃣ Save payment
      await Payment.findOneAndUpdate(
        { transactionId }, // 🔑 UNIQUE KEY FROM STRIPE
        {
          userId,
          amount: session.amount_total / 100,
          paymentMethod: "stripe",
          paymentStatus: "success",
          subscriptionId: subscription._id,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Stripe webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
