import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

async function removeSampleTrainers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove sample trainers (john.smith@fitness.com, etc.)
    const sampleEmails = [
      'john.smith@fitness.com',
      'sarah.johnson@fitness.com', 
      'mike.wilson@fitness.com',
      'emma.davis@fitness.com',
      'david.lee@fitness.com'
    ];
    
    const sampleUsers = await User.find({ email: { $in: sampleEmails } });
    const sampleUserIds = sampleUsers.map(u => u._id);
    
    await Trainer.deleteMany({ userId: { $in: sampleUserIds } });
    await User.deleteMany({ email: { $in: sampleEmails } });
    
    console.log('Removed sample trainers');
    
    const remainingTrainers = await Trainer.find({}).populate('userId', 'name email');
    console.log(`Remaining trainers: ${remainingTrainers.length}`);
    
    remainingTrainers.forEach((t, i) => {
      console.log(`${i+1}. ${t.userId?.name} - ${t.specialization}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error removing sample trainers:', error);
    process.exit(1);
  }
}

removeSampleTrainers();
