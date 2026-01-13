import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import dotenv from 'dotenv';
dotenv.config();

async function updatePlanPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('Connected to MongoDB');
    
    // Update Basic Plan
    await Plan.updateOne(
      { name: /basic/i }, 
      { $set: { price: 999, duration: 30 } }
    );
    console.log('Basic Plan updated: ₹999 for 1 month');
    
    // Update Standard Plan
    await Plan.updateOne(
      { name: /standard/i }, 
      { $set: { price: 1999, duration: 90 } }
    );
    console.log('Standard Plan updated: ₹1999 for 3 months');
    
    // Update Elite Plan
    await Plan.updateOne(
      { name: /elite/i }, 
      { $set: { price: 2999, duration: 180 } }
    );
    console.log('Elite Plan updated: ₹2999 for 6 months');
    
    console.log('All plans updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating plans:', error);
    process.exit(1);
  }
}

updatePlanPrices();
