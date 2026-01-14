import mongoose from 'mongoose';
import User from './models/User.js';
import Nutrition from './models/Nutrition.js';

async function createNutritionData() {
  try {
    console.log('🔍 Creating nutrition data for test user...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Find test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }
    
    console.log('✅ Found user:', user.name);
    
    // Remove existing nutrition data
    await Nutrition.deleteMany({ user: user._id });
    console.log('🗑️ Cleared existing nutrition data');
    
    // Create today's nutrition log
    const todayNutrition = new Nutrition({
      user: user._id,
      date: new Date(),
      meals: [
        {
          type: 'breakfast',
          name: 'Oatmeal with Berries',
          time: '08:00 AM',
          foods: [
            {
              name: 'Oatmeal',
              quantity: 150,
              unit: 'grams',
              calories: 150,
              protein: 5,
              carbs: 27,
              fat: 3
            },
            {
              name: 'Mixed Berries',
              quantity: 1,
              unit: 'cups',
              calories: 80,
              protein: 1,
              carbs: 20,
              fat: 0.5
            }
          ],
          totalCalories: 230,
          totalProtein: 6,
          totalCarbs: 47,
          totalFat: 3.5
        },
        {
          type: 'lunch',
          name: 'Grilled Chicken Salad',
          time: '12:30 PM',
          foods: [
            {
              name: 'Grilled Chicken Breast',
              quantity: 150,
              unit: 'grams',
              calories: 250,
              protein: 45,
              carbs: 0,
              fat: 5
            },
            {
              name: 'Mixed Greens',
              quantity: 2,
              unit: 'cups',
              calories: 30,
              protein: 2,
              carbs: 6,
              fat: 0
            }
          ],
          totalCalories: 280,
          totalProtein: 47,
          totalCarbs: 6,
          totalFat: 5
        }
      ],
      waterIntake: 2.0, // liters
      notes: 'Good protein intake today',
      dailyGoals: {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65,
        water: 2.5
      }
    });
    
    await todayNutrition.save();
    console.log('✅ Today\'s nutrition data created');
    
    // Create yesterday's nutrition log
    const yesterdayNutrition = new Nutrition({
      user: user._id,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      meals: [
        {
          type: 'breakfast',
          name: 'Protein Smoothie',
          time: '07:30 AM',
          foods: [
            {
              name: 'Whey Protein',
              quantity: 30,
              unit: 'grams',
              calories: 120,
              protein: 25,
              carbs: 3,
              fat: 1
            },
            {
              name: 'Banana',
              quantity: 1,
              unit: 'pieces',
              calories: 105,
              protein: 1.3,
              carbs: 27,
              fat: 0.4
            }
          ],
          totalCalories: 225,
          totalProtein: 26.3,
          totalCarbs: 30,
          totalFat: 1.4
        },
        {
          type: 'post_workout',
          name: 'Post-Workout Shake',
          time: '06:00 PM',
          foods: [
            {
              name: 'Recovery Shake',
              quantity: 250,
              unit: 'ml',
              calories: 180,
              protein: 20,
              carbs: 25,
              fat: 2
            }
          ],
          totalCalories: 180,
          totalProtein: 20,
          totalCarbs: 25,
          totalFat: 2
        }
      ],
      waterIntake: 2.5,
      notes: 'Post-workout nutrition optimized',
      dailyGoals: {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65,
        water: 2.5
      }
    });
    
    await yesterdayNutrition.save();
    console.log('✅ Yesterday\'s nutrition data created');
    
    // Create day before yesterday's nutrition log
    const dayBeforeNutrition = new Nutrition({
      user: user._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      meals: [
        {
          type: 'dinner',
          name: 'Salmon with Vegetables',
          time: '07:00 PM',
          foods: [
            {
              name: 'Grilled Salmon',
              quantity: 200,
              unit: 'grams',
              calories: 400,
              protein: 40,
              carbs: 0,
              fat: 25
            },
            {
              name: 'Roasted Vegetables',
              quantity: 1.5,
              unit: 'cups',
              calories: 80,
              protein: 3,
              carbs: 15,
              fat: 2
            }
          ],
          totalCalories: 480,
          totalProtein: 43,
          totalCarbs: 15,
          totalFat: 27
        }
      ],
      waterIntake: 1.8,
      notes: 'High protein dinner',
      dailyGoals: {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65,
        water: 2.5
      }
    });
    
    await dayBeforeNutrition.save();
    console.log('✅ Day before nutrition data created');
    
    // Fetch and display the data
    const nutritionData = await Nutrition.find({ user: user._id })
      .sort({ date: -1 });
    
    console.log('\n🔍 Nutrition logs created:', nutritionData.length);
    
    nutritionData.forEach((nutrition, index) => {
      const totalCalories = nutrition.meals.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);
      const totalProtein = nutrition.meals.reduce((sum, meal) => sum + (meal.totalProtein || 0), 0);
      
      console.log(`\n📅 Day ${index + 1}: ${nutrition.date.toLocaleDateString()}`);
      console.log(`  Meals: ${nutrition.meals.length}`);
      console.log(`  Total Calories: ${totalCalories}`);
      console.log(`  Total Protein: ${totalProtein}g`);
      console.log(`  Water Intake: ${nutrition.waterIntake}L`);
      console.log(`  Notes: ${nutrition.notes || 'None'}`);
    });
    
    console.log('\n🎉 Nutrition data created successfully!');
    console.log('📱 Dashboard will now show:');
    console.log('  ✅ Today\'s calories and protein');
    console.log('  ✅ Nutrition goals progress');
    console.log('  ✅ Recent nutrition logs');
    console.log('🌐 Visit: http://localhost:5173/user/dashboard');
    console.log('👤 Login: test@example.com / password123');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createNutritionData();
