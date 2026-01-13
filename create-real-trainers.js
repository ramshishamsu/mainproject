import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

// Trainer specializations mapping
const specializations = [
  'Strength Training & Bodybuilding',
  'Yoga & Flexibility', 
  'CrossFit & HIIT',
  'Nutrition & Weight Loss',
  'Sports Performance & Athletic Training',
  'Personal Training & Fitness Coaching',
  'Pilates & Core Strength',
  'Martial Arts & Self Defense',
  'Swimming & Aqua Fitness',
  'Rehabilitation & Physical Therapy'
];

async function createTrainerProfiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find trainer users without trainer profiles
    const trainerUsers = await User.find({ role: 'trainer' });
    const existingTrainerProfiles = await Trainer.find({});
    const existingUserIds = existingTrainerProfiles.map(t => t.userId.toString());
    
    const trainersWithoutProfiles = trainerUsers.filter(user => 
      !existingUserIds.includes(user._id.toString())
    );

    console.log(`Found ${trainersWithoutProfiles.length} trainers without profiles`);

    // Create trainer profiles for existing trainers
    for (let i = 0; i < trainersWithoutProfiles.length; i++) {
      const user = trainersWithoutProfiles[i];
      
      // Create trainer profile
      await Trainer.create({
        userId: user._id,
        specialization: specializations[i % specializations.length],
        experience: Math.floor(Math.random() * 10) + 3, // 3-12 years experience
        phone: `+123456789${i}`,
        profileImage: user.profileImage || `https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face${(i % 5) + 1}.jpg`,
        status: user.status === 'active' ? 'approved' : 'pending'
      });

      console.log(`Created trainer profile for: ${user.name}`);
    }

    // Update isTrainerApproved for active trainers
    await User.updateMany(
      { role: 'trainer', status: 'active' },
      { isTrainerApproved: true }
    );

    console.log('\n=== Updated trainer profiles ===');
    
    // Show final result
    const allTrainerProfiles = await Trainer.find({}).populate('userId', 'name email status');
    console.log(`\nTotal trainer profiles: ${allTrainerProfiles.length}`);
    
    const approvedTrainers = allTrainerProfiles.filter(t => t.status === 'approved');
    console.log(`Approved trainers: ${approvedTrainers.length}`);
    
    console.log('\n=== Approved Trainers ===');
    approvedTrainers.forEach((trainer, index) => {
      console.log(`${index + 1}. ${trainer.userId?.name} - ${trainer.specialization}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating trainer profiles:', error);
    process.exit(1);
  }
}

createTrainerProfiles();
