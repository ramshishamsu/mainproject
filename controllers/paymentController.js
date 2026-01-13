import Stripe from "stripe";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| LAZY STRIPE INITIALIZATION (CRITICAL FIX)
|--------------------------------------------------------------------------
*/

let stripe;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing in .env");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

/*
|--------------------------------------------------------------------------
| CREATE STRIPE CHECKOUT SESSION (HOSTED)
|--------------------------------------------------------------------------
*/

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("=== PAYMENT DEBUG START ===");
    console.log("Request body:", req.body);
    console.log("User from middleware:", req.user);
    
    const stripe = getStripe();
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

    console.log("Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: plan.name
            },
            unit_amount: Math.round(price * 100)
          },
          quantity: 1
        }
      ],

      // ✅ THIS IS THE FIX 🔥
      metadata: {
        userId,
        planId: plan._id.toString()
      },

      success_url: `${process.env.CLIENT_URL}/user/success`,
      cancel_url: `${process.env.CLIENT_URL}/user/cancel`
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    console.error("Full error:", error);
    console.error("Plan ID:", req.body.planId);
    console.error("User ID:", req.user?._id);
    console.error("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
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
| STRIPE WEBHOOK (OPTIONAL)
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Get plan details to calculate end date
    const plan = await Plan.findById(session.metadata?.planId);
    if (!plan) {
      console.error('Plan not found for subscription activation');
      return res.json({ received: true });
    }

    // Calculate end date based on plan duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    await Payment.create({
      userId: session.metadata?.userId,
      amount: session.amount_total / 100,
      paymentMethod: "stripe",
      paymentStatus: "success",
      transactionId: session.id
    });

    await User.findByIdAndUpdate(session.metadata?.userId, {
      "subscription.plan": session.metadata?.planId,
      "subscription.status": "active",
      "subscription.startDate": startDate,
      "subscription.endDate": endDate
    });

    console.log(`Subscription activated for user ${session.metadata?.userId} until ${endDate}`);
  }

  res.json({ received: true });
};
