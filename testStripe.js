import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const testStripe = async () => {
  try {
    console.log("Testing Stripe configuration...");
    console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Stripe key starts with:", process.env.STRIPE_SECRET_KEY?.substring(0, 10) + "...");
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test basic Stripe API call
    const account = await stripe.accounts.retrieve();
    console.log("✅ Stripe connection successful");
    console.log("Account country:", account.country);
    console.log("Account currency:", account.default_currency);
    
    // Test creating a checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Test Product" },
          unit_amount: 59900 // $599.00 in cents
        },
        quantity: 1
      }],
      success_url: "https://fitness-management-frontend.vercel.app/success",
      cancel_url: "https://fitness-management-frontend.vercel.app/cancel"
    });
    
    console.log("✅ Checkout session created:", session.url);
    
  } catch (error) {
    console.error("❌ Stripe test failed:");
    console.error("Error:", error.message);
    console.error("Type:", error.type);
    console.error("Code:", error.code);
  }
};

testStripe();
