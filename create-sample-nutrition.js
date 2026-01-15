import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Nutrition from './models/Nutrition.js';
import User from './models/User.js';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const createSampleNutritionData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env file');
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('Test user not found. Please create a test user first.');
      return;
    }

    console.log('Creating sample nutrition data for user:', user.name);

    // Sample nutrition data
    const nutritionData = [
      {
        user: user._id,
        date: new Date(),
        meals: [
          {
            type: 'breakfast',
            name: 'Healthy Breakfast',
            time: '08:00 AM',
            foods: [
              {
                name: 'Oatmeal',
                quantity: 100,
                unit: 'grams',
                calories: 150,
                protein: 5,
                carbs: 27,
                fat: 3
              },
              {
                name: 'Banana',
                quantity: 1,
                unit: 'pieces',
                calories: 105,
                protein: 1,
                carbs: 27,
                fat: 0
              },
              {
                name: 'Almond Milk',
                quantity: 250,
                unit: 'ml',
                calories: 60,
                protein: 1,
                carbs: 8,
                fat: 2.5
              }
            ],
            totalCalories: 315,
            totalProtein: 7,
            totalCarbs: 62,
            totalFat: 5.5
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
                protein: 46,
                carbs: 0,
                fat: 5
              },
              {
                name: 'Mixed Greens',
                quantity: 100,
                unit: 'grams',
                calories: 20,
                protein: 2,
                carbs: 4,
                fat: 0
              },
              {
                name: 'Olive Oil',
                quantity: 15,
                unit: 'ml',
                calories: 120,
                protein: 0,
                carbs: 0,
                fat: 14
              }
            ],
            totalCalories: 390,
            totalProtein: 48,
            totalCarbs: 4,
            totalFat: 19
          },
          {
            type: 'dinner',
            name: 'Salmon with Vegetables',
            time: '07:00 PM',
            foods: [
              {
                name: 'Grilled Salmon',
                quantity: 200,
                unit: 'grams',
                calories: 416,
                protein: 40,
                carbs: 0,
                fat: 28
              },
              {
                name: 'Brown Rice',
                quantity: 150,
                unit: 'grams',
                calories: 165,
                protein: 4,
                carbs: 34,
                fat: 1
              },
              {
                name: 'Steamed Broccoli',
                quantity: 100,
                unit: 'grams',
                calories: 35,
                protein: 3,
                carbs: 7,
                fat: 0
              }
            ],
            totalCalories: 616,
            totalProtein: 47,
            totalCarbs: 41,
            totalFat: 29
          }
        ],
        waterIntake: 2.5,
        dailyGoals: {
          calories: 2000,
          protein: 50,
          carbs: 250,
          fat: 65,
          water: 3
        },
        notes: 'Created by trainer for testing'
      },
      {
        user: user._id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        meals: [
          {
            type: 'breakfast',
            name: 'Quick Breakfast',
            time: '07:30 AM',
            foods: [
              {
                name: 'Whole Wheat Toast',
                quantity: 2,
                unit: 'pieces',
                calories: 160,
                protein: 6,
                carbs: 30,
                fat: 2
              },
              {
                name: 'Peanut Butter',
                quantity: 30,
                unit: 'grams',
                calories: 188,
                protein: 8,
                carbs: 6,
                fat: 16
              }
            ],
            totalCalories: 348,
            totalProtein: 14,
            totalCarbs: 36,
            totalFat: 18
          }
        ],
        waterIntake: 2.0,
        dailyGoals: {
          calories: 2000,
          protein: 50,
          carbs: 250,
          fat: 65,
          water: 3
        },
        notes: 'Yesterday\'s nutrition log'
      }
    ];

    // Clear existing nutrition data for this user
    await Nutrition.deleteMany({ user: user._id });
    console.log('Cleared existing nutrition data');

    // Insert new nutrition data
    const createdNutrition = await Nutrition.insertMany(nutritionData);
    console.log(`Created ${createdNutrition.length} nutrition records`);

    // Verify the data
    const allNutrition = await Nutrition.find({ user: user._id }).sort({ date: -1 });
    console.log('\nNutrition data created:');
    allNutrition.forEach((log, index) => {
      console.log(`${index + 1}. Date: ${log.date.toLocaleDateString()}`);
      console.log(`   Meals: ${log.meals.length}`);
      console.log(`   Total Calories: ${log.meals.reduce((sum, meal) => sum + meal.totalCalories, 0)}`);
      console.log(`   Water: ${log.waterIntake}L`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Sample nutrition data created successfully!');

  } catch (error) {
    console.error('Error creating sample nutrition data:', error);
    process.exit(1);
  }
};

createSampleNutritionData();
