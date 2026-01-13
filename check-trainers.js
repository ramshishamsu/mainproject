import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkExistingTrainers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check for existing trainer users
    const trainerUsers = await User.find({ role: 'trainer' });
    console.log(`\n=== Found ${trainerUsers.length} users with role 'trainer' ===`);
    
    trainerUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Is Trainer Approved: ${user.isTrainerApproved}`);
      console.log(`   User ID: ${user._id}`);
    });

    // Check for trainer profiles
    const trainerProfiles = await Trainer.find({}).populate('userId', 'name email');
    console.log(`\n=== Found ${trainerProfiles.length} trainer profiles ===`);
    
    trainerProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.userId?.name || 'Unknown'}`);
      console.log(`   Email: ${profile.userId?.email || 'Unknown'}`);
      console.log(`   Specialization: ${profile.specialization || 'Not specified'}`);
      console.log(`   Experience: ${profile.experience || 'Not specified'} years`);
      console.log(`   Status: ${profile.status}`);
      console.log(`   Trainer ID: ${profile._id}`);
    });

    // Show only approved trainers
    const approvedTrainers = await Trainer.find({ status: 'approved' }).populate('userId', 'name email');
    console.log(`\n=== ${approvedTrainers.length} APPROVED trainers available for users ===`);
    
    approvedTrainers.forEach((trainer, index) => {
      console.log(`\n${index + 1}. ${trainer.userId?.name || 'Unknown'}`);
      console.log(`   Specialization: ${trainer.specialization || 'Not specified'}`);
      console.log(`   Experience: ${trainer.experience || 'Not specified'} years`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking trainers:', error);
    process.exit(1);
  }
}

checkExistingTrainers();
