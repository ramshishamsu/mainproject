import mongoose from 'mongoose';
import User from './models/User.js';
import Plan from './models/Plan.js';
import Subscription from './models/Subscription.js';
import Workout from './models/Workout.js';
import Trainer from './models/Trainer.js';

async function createTestData() {
  try {
    console.log('🔍 Creating test data for workout assignment...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Create test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'user'
      });
      await user.save();
      console.log('✅ Test user created');
    }
    
    // Create test trainer
    let trainer = await Trainer.findOne();
    if (!trainer) {
      // First create a user for trainer
      const trainerUser = new User({
        name: 'Test Trainer',
        email: 'trainer@example.com',
        password: 'password123',
        phone: '0987654321',
        role: 'trainer'
      });
      await trainerUser.save();
      
      trainer = new Trainer({
        userId: trainerUser._id,
        name: 'Test Trainer',
        email: 'trainer@example.com',
        specialization: 'Fitness',
        experience: 5,
        bio: 'Experienced fitness trainer'
      });
      await trainer.save();
      console.log('✅ Test trainer created');
    }
    
    // Create test plan
    let plan = await Plan.findOne();
    if (!plan) {
      plan = new Plan({
        name: 'Premium Plan',
        description: 'Full access to all features',
        price: 999,
        duration: 30,
        features: ['Personal Training', 'Nutrition Plans', 'Workout Programs'],
        isActive: true
      });
      await plan.save();
      console.log('✅ Test plan created');
    }
    
    // Create test subscription
    let subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        planId: plan._id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentId: 'test_payment_' + Date.now(),
        amount: plan.price
      });
      await subscription.save();
      console.log('✅ Test subscription created');
    }
    
    // Create test workout assigned by trainer
    const workout = new Workout({
      user: user._id,
      trainer: trainer._id,
      title: 'Morning Cardio Routine',
      description: 'Start your day with energizing cardio exercises',
      category: 'Cardio',
      difficulty: 'Beginner',
      exercises: [
        {
          name: 'Jumping Jacks',
          sets: 3,
          reps: 15,
          duration: 5,
          calories: 50
        },
        {
          name: 'Mountain Climbers',
          sets: 3,
          reps: 20,
          duration: 5,
          calories: 60
        }
      ],
      totalCalories: 110,
      totalDuration: 10,
      completed: false,
      assignedDate: new Date()
    });
    
    await workout.save();
    console.log('✅ Test workout assigned to user');
    
    // Test the API response
    const workouts = await Workout.find({ user: user._id }).populate('trainer', 'name email');
    console.log('🔍 User workouts:', workouts.length);
    
    if (workouts.length > 0) {
      console.log('✅ Sample workout:', {
        title: workouts[0].title,
        trainer: workouts[0].trainer?.name,
        exercises: workouts[0].exercises.length,
        completed: workouts[0].completed
      });
    }
    
    console.log('🎉 Test data created successfully!');
    console.log('📱 User can now see assigned workouts in dashboard!');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestData();
