import mongoose from 'mongoose';
import User from './models/User.js';
import Workout from './models/Workout.js';
import Trainer from './models/Trainer.js';

async function createTestWorkout() {
  try {
    console.log('🔍 Creating test workout assignment...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Get existing user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found. Creating one...');
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
    
    // Get existing trainer
    const trainer = await Trainer.findOne();
    if (!trainer) {
      console.log('❌ No trainer found. Please create a trainer first.');
      process.exit(1);
    }
    
    console.log('✅ Found trainer:', trainer.name);
    
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
        },
        {
          name: 'High Knees',
          sets: 3,
          reps: 30,
          duration: 3,
          calories: 40
        }
      ],
      totalCalories: 150,
      totalDuration: 13,
      completed: false,
      assignedDate: new Date()
    });
    
    await workout.save();
    console.log('✅ Test workout assigned to user');
    
    // Create another workout
    const workout2 = new Workout({
      user: user._id,
      trainer: trainer._id,
      title: 'Strength Training',
      description: 'Build muscle with targeted exercises',
      category: 'Strength',
      difficulty: 'Intermediate',
      exercises: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: 12,
          duration: 5,
          calories: 45
        },
        {
          name: 'Squats',
          sets: 3,
          reps: 15,
          duration: 6,
          calories: 55
        }
      ],
      totalCalories: 100,
      totalDuration: 11,
      completed: true,
      assignedDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
    });
    
    await workout2.save();
    console.log('✅ Second workout assigned (completed)');
    
    // Test the API response
    const workouts = await Workout.find({ user: user._id })
      .populate('trainer', 'name email')
      .sort({ assignedDate: -1 });
    
    console.log('🔍 User workouts:', workouts.length);
    
    workouts.forEach((workout, index) => {
      console.log(`\n📋 Workout ${index + 1}:`);
      console.log(`  Title: ${workout.title}`);
      console.log(`  Trainer: ${workout.trainer?.name || 'Not assigned'}`);
      console.log(`  Category: ${workout.category}`);
      console.log(`  Exercises: ${workout.exercises.length}`);
      console.log(`  Duration: ${workout.totalDuration} minutes`);
      console.log(`  Calories: ${workout.totalCalories}`);
      console.log(`  Status: ${workout.completed ? '✅ Completed' : '⏳ Pending'}`);
    });
    
    console.log('\n🎉 Test workouts created successfully!');
    console.log('📱 User can now see assigned workouts in dashboard!');
    console.log('🌐 Visit: http://localhost:5173/user/dashboard');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestWorkout();
