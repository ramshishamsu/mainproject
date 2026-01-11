import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const debugPayment = async () => {
  try {
    await mongoose.connect('mongodb+srv://ramshishamsu22_db_user:FDXoCFPyZRP0hzVn@cluster0.xvfw4pj.mongodb.net/fitnessDB');
    console.log('Connected to Production MongoDB');

    // Get a plan
    const plan = await Plan.findOne({ name: 'Premium Plan' });
    console.log('Plan found:', plan ? 'Yes' : 'No');
    if (plan) {
      console.log('Plan name:', plan.name);
      console.log('Plan price:', plan.price);
      console.log('Plan price type:', typeof plan.price);
    }

    // Test Stripe
    console.log('\nTesting Stripe...');
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "aud",
          product_data: { name: plan.name },
          unit_amount: Math.round(Number(plan.price) * 100)
        },
        quantity: 1
      }],
      success_url: "https://fitness-management-frontend.vercel.app/success",
      cancel_url: "https://fitness-management-frontend.vercel.app/cancel"
    });
    
    console.log('✅ Success! Checkout URL:', session.url);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Code:', error.code);
    console.error('Param:', error.param);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
  
  await mongoose.disconnect();
};

debugPayment();
