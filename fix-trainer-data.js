import mongoose from 'mongoose';
import Trainer from './models/Trainer.js';
import User from './models/User.js';

async function fixTrainerData() {
  try {
    console.log('🔍 Fixing trainer data...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Find trainer user
    const trainerUser = await User.findOne({ email: 'trainer@example.com' });
    if (!trainerUser) {
      console.log('❌ Trainer user not found');
      process.exit(1);
    }
    
    console.log('✅ Found trainer user:', trainerUser.name);
    
    // Find trainer profile
    let trainer = await Trainer.findOne({ userId: trainerUser._id });
    if (!trainer) {
      console.log('❌ Trainer profile not found');
      process.exit(1);
    }
    
    console.log('✅ Found trainer profile');
    console.log('Current data:', {
      name: trainer.name,
      email: trainer.email,
      specialization: trainer.specialization
    });
    
    // Update trainer profile with proper data
    trainer.name = trainerUser.name;
    trainer.email = trainerUser.email;
    trainer.profileImage = `https://picsum.photos/seed/${trainerUser.name.replace(/\s+/g, '')}/200/200.jpg`;
    
    await trainer.save();
    console.log('✅ Updated trainer profile');
    
    // Verify the update
    trainer = await Trainer.findById(trainer._id);
    console.log('✅ Verified trainer data:', {
      name: trainer.name,
      email: trainer.email,
      profileImage: trainer.profileImage ? 'Set' : 'Not set'
    });
    
    console.log('\n🎉 Trainer data fixed successfully!');
    console.log('📱 Trainers page will now show proper data');
    console.log('🌐 Visit: http://localhost:5173/user/trainers');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTrainerData();
