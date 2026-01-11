import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

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
    console.log('Sample plans created successfully');

    const allPlans = await Plan.find();
    console.log('Available plans:');
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration} month(s) (ID: ${plan._id})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
