import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const addPlansToProduction = async () => {
  try {
    // Use production MongoDB URI
    await mongoose.connect('mongodb+srv://ramshishamsu22_db_user:FDXoCFPyZRP0hzVn@cluster0.xvfw4pj.mongodb.net/fitnessDB');
    console.log('Connected to Production MongoDB');

    // Check if plans already exist
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      console.log('Plans already exist:');
      existingPlans.forEach(plan => {
        console.log(`- ${plan.name}: ₹${plan.price} (ID: ${plan._id})`);
      });
      await mongoose.disconnect();
      return;
    }

    // Create sample plans
    const plans = [
      {
        name: 'Basic Plan',
        price: 299,
        duration: 1,
        features: ['Access to gym equipment', 'Basic workout plans', 'Email support']
      },
      {
        name: 'Premium Plan', 
        price: 599,
        duration: 1,
        features: ['Access to gym equipment', 'Premium workout plans', 'Personal trainer consultation', 'Nutrition guidance', 'Priority support']
      },
      {
        name: 'Annual Plan',
        price: 5999,
        duration: 12,
        features: ['All Premium features', 'Annual savings', 'VIP access', 'Custom meal plans']
      }
    ];

    await Plan.insertMany(plans);
    console.log('✅ Plans added to production database successfully');

    const allPlans = await Plan.find();
    console.log('Available plans in production:');
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration} month(s) (ID: ${plan._id})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from Production MongoDB');
  } catch (error) {
    console.error('Error adding plans to production:', error);
    process.exit(1);
  }
};

addPlansToProduction();
