import mongoose from 'mongoose';
import Trainer from './models/Trainer.js';

async function updateTrainerImages() {
  try {
    console.log('🔍 Updating trainer profile images...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Find all trainers
    const trainers = await Trainer.find();
    console.log('👥 Found trainers:', trainers.length);
    
    for (let i = 0; i < trainers.length; i++) {
      const trainer = trainers[i];
      console.log(`🔄 Updating trainer ${i + 1}: ${trainer.name}`);
      
      // Update profile image to use reliable placeholder
      trainer.profileImage = `https://picsum.photos/seed/trainer${i}/200/200.jpg`;
      
      await trainer.save();
      console.log(`✅ Updated ${trainer.name} with new profile image`);
    }
    
    console.log('\n🎉 All trainer images updated successfully!');
    console.log('📱 Trainers page will now show proper images');
    console.log('🌐 Visit: http://localhost:5173/user/trainers');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTrainerImages();
