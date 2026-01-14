import mongoose from 'mongoose';
import User from './models/User.js';
import Workout from './models/Workout.js';

async function createTestWorkout() {
  try {
    console.log('🔍 Creating test workout for dashboard...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Get or create user
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
    
    console.log('✅ Found user:', user.name);
    
    // Create test workout (without trainer for now)
    const workout = new Workout({
      user: user._id,
      title: 'Morning Cardio Routine',
      description: 'Start your day with energizing cardio exercises',
      category: 'cardio',
      difficulty: 'beginner',
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
      date: new Date()
    });
    
    await workout.save();
    console.log('✅ Test workout created (pending)');
    
    // Create another workout (completed)
    const workout2 = new Workout({
      user: user._id,
      title: 'Strength Training',
      description: 'Build muscle with targeted exercises',
      category: 'strength',
      difficulty: 'intermediate',
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
        },
        {
          name: 'Plank',
          sets: 1,
          reps: 1,
          duration: 2,
          calories: 20
        }
      ],
      totalCalories: 120,
      totalDuration: 13,
      completed: true,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
    });
    
    await workout2.save();
    console.log('✅ Second workout created (completed)');
    
    // Create a third workout
    const workout3 = new Workout({
      user: user._id,
      title: 'Flexibility & Stretching',
      description: 'Improve flexibility and prevent injury',
      category: 'flexibility',
      difficulty: 'beginner',
      exercises: [
        {
          name: 'Hamstring Stretch',
          sets: 2,
          reps: 1,
          duration: 3,
          calories: 15
        },
        {
          name: 'Shoulder Stretch',
          sets: 2,
          reps: 1,
          duration: 2,
          calories: 10
        }
      ],
      totalCalories: 25,
      totalDuration: 5,
      completed: false,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });
    
    await workout3.save();
    console.log('✅ Third workout created (pending)');
    
    // Test the API response
    const workouts = await Workout.find({ user: user._id })
      .sort({ date: -1 });
    
    console.log('\n🔍 User workouts:', workouts.length);
    
    workouts.forEach((workout, index) => {
      console.log(`\n📋 Workout ${index + 1}:`);
      console.log(`  Title: ${workout.title}`);
      console.log(`  Category: ${workout.category}`);
      console.log(`  Exercises: ${workout.exercises.length}`);
      console.log(`  Duration: ${workout.totalDuration} minutes`);
      console.log(`  Calories: ${workout.totalCalories}`);
      console.log(`  Status: ${workout.completed ? '✅ Completed' : '⏳ Pending'}`);
      console.log(`  Date: ${workout.date.toLocaleDateString()}`);
    });
    
    console.log('\n🎉 Test workouts created successfully!');
    console.log('📱 User can now see workouts in dashboard!');
    console.log('🌐 Visit: http://localhost:5173/user/dashboard');
    console.log('👤 Login with: test@example.com / password123');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestWorkout();
