import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleTrainers = [
  {
    name: 'John Smith',
    email: 'john.smith@fitness.com',
    specialization: 'Strength Training & Bodybuilding',
    experience: 8,
    phone: '+1234567890',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face1.jpg'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@fitness.com',
    specialization: 'Yoga & Flexibility',
    experience: 6,
    phone: '+1234567891',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face2.jpg'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@fitness.com',
    specialization: 'CrossFit & HIIT',
    experience: 10,
    phone: '+1234567892',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face3.jpg'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@fitness.com',
    specialization: 'Nutrition & Weight Loss',
    experience: 7,
    phone: '+1234567893',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face4.jpg'
  },
  {
    name: 'David Lee',
    email: 'david.lee@fitness.com',
    specialization: 'Sports Performance & Athletic Training',
    experience: 12,
    phone: '+1234567894',
    profileImage: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,g_face,r_max/face5.jpg'
  }
];

async function createSampleTrainers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing trainers
    await Trainer.deleteMany({});
    console.log('Cleared existing trainers');

    // Create trainer users and trainer profiles
    for (const trainerData of sampleTrainers) {
      // Create user account for trainer
      const user = await User.create({
        name: trainerData.name,
        email: trainerData.email,
        password: 'trainer123', // Default password
        role: 'trainer',
        status: 'approved',
        isTrainerApproved: true,
        profileImage: trainerData.profileImage
      });

      // Create trainer profile
      await Trainer.create({
        userId: user._id,
        specialization: trainerData.specialization,
        experience: trainerData.experience,
        phone: trainerData.phone,
        profileImage: trainerData.profileImage,
        status: 'approved' // Auto-approve for demo
      });

      console.log(`Created trainer: ${trainerData.name}`);
    }

    console.log('Sample trainers created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample trainers:', error);
    process.exit(1);
  }
}

createSampleTrainers();
