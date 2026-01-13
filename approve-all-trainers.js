import mongoose from 'mongoose';
import User from './models/User.js';
import Trainer from './models/Trainer.js';
import dotenv from 'dotenv';

dotenv.config();

async function approveAllTrainers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Approve all pending trainers
    const result = await Trainer.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    );

    console.log(`✅ Approved ${result.modifiedCount} trainers`);

    // Show final result
    const approvedTrainers = await Trainer.find({ status: 'approved' })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n=== Total Approved Trainers: ${approvedTrainers.length} ===`);

    approvedTrainers.forEach((trainer, index) => {
      console.log(`${index + 1}. ${trainer.userId?.name} - ${trainer.specialization}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error approving trainers:', error);
    process.exit(1);
  }
}

approveAllTrainers();
