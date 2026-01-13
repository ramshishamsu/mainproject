import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

async function testTrainersEndpoint() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test the exact query that getAllTrainers uses
    const query = { status: 'approved' }; // This is what should happen for public access
    
    console.log('\n=== Testing Query ===');
    console.log('Query:', JSON.stringify(query, null, 2));

    const trainers = await Trainer.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(0);

    console.log('\n=== Query Results ===');
    console.log(`Found ${trainers.length} trainers`);

    trainers.forEach((trainer, index) => {
      console.log(`\n${index + 1}. Trainer ID: ${trainer._id}`);
      console.log(`   User ID: ${trainer.userId?._id}`);
      console.log(`   Name: ${trainer.userId?.name || 'NULL'}`);
      console.log(`   Email: ${trainer.userId?.email || 'NULL'}`);
      console.log(`   Specialization: ${trainer.specialization || 'NULL'}`);
      console.log(`   Experience: ${trainer.experience || 'NULL'}`);
      console.log(`   Status: ${trainer.status}`);
    });

    // Also check all trainers regardless of status
    console.log('\n=== All Trainers (Any Status) ===');
    const allTrainers = await Trainer.find({}).populate("userId", "name email");
    console.log(`Total trainers in database: ${allTrainers.length}`);

    allTrainers.forEach((trainer, index) => {
      console.log(`${index + 1}. ${trainer.userId?.name || 'Unknown'} - Status: ${trainer.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error testing trainers:', error);
    process.exit(1);
  }
}

testTrainersEndpoint();
