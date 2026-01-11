import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const updatePlansToAUD = async () => {
  try {
    await mongoose.connect('mongodb+srv://ramshishamsu22_db_user:FDXoCFPyZRP0hzVn@cluster0.xvfw4pj.mongodb.net/fitnessDB');
    console.log('Connected to Production MongoDB');

    // Update plans to AUD prices (rough conversion from INR to AUD)
    const plans = await Plan.find();
    
    for (const plan of plans) {
      let newPrice;
      if (plan.name.includes('Basic')) {
        newPrice = 5; // ~₹299 = $5 AUD
      } else if (plan.name.includes('Premium')) {
        newPrice = 10; // ~₹599 = $10 AUD  
      } else if (plan.name.includes('Annual')) {
        newPrice = 95; // ~₹5999 = $95 AUD
      }
      
      if (newPrice) {
        plan.price = newPrice;
        await plan.save();
        console.log(`✅ Updated ${plan.name}: $${newPrice} AUD`);
      }
    }

    console.log('✅ All plans updated to AUD');
    
    const updatedPlans = await Plan.find();
    console.log('Updated plans:');
    updatedPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price} AUD (ID: ${plan._id})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating plans:', error);
  }
};

updatePlansToAUD();
