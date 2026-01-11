import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| NUTRITION SCHEMA - Enhanced for comprehensive tracking
|--------------------------------------------------------------------------
| - Supports multiple meals per day
| - Tracks macronutrients and calories
| - Includes water intake and goals
*/
const nutritionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    // Multiple meals per day
    meals: [{
      type: {
        type: String,
        enum: ["breakfast", "lunch", "dinner", "snack", "post_workout"],
        required: true
      },
      
      foods: [{
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        },
        unit: {
          type: String,
          enum: ["grams", "oz", "cups", "pieces", "ml", "tbsp"],
          default: "grams"
        },
        
        // Detailed macronutrients
        calories: {
          type: Number,
          required: true,
          min: 0
        },
        
        protein: {
          type: Number,
          required: true,
          min: 0
        },
        
        carbs: {
          type: Number,
          required: true,
          min: 0
        },
        
        fat: {
          type: Number,
          required: true,
          min: 0
        },
        
        fiber: {
          type: Number,
          min: 0
        },
        
        sugar: {
          type: Number,
          min: 0
        },
        
        sodium: {
          type: Number,
          min: 0
        },
        
        vitamins: [{
          name: String,
          amount: Number,
          unit: String
        }]
      }],
      
      // Meal totals
      totalCalories: {
        type: Number,
        required: true,
        min: 0
      },
      
      totalProtein: {
        type: Number,
        required: true,
        min: 0
      },
      
      totalCarbs: {
        type: Number,
        required: true,
        min: 0
      },
      
      totalFat: {
        type: Number,
        required: true,
        min: 0
      }
    }],

    // Daily water intake
    waterIntake: {
      type: Number,
      min: 0,
      default: 0  // in liters
    },

    // Daily nutrition goals
    dailyGoals: {
      calories: {
        type: Number,
        min: 0
      },
      
      protein: {
        type: Number,
        min: 0
      },
      
      carbs: {
        type: Number,
        min: 0
      },
      
      fat: {
        type: Number,
        min: 0
      },
      
      water: {
        type: Number,
        min: 0
      }
    },

    // Nutrition insights and recommendations
    insights: {
      mealQuality: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
        default: "good"
      },
      
      recommendations: [{
        type: {
          type: String,
          enum: ["increase_protein", "reduce_carbs", "add_vegetables", "more_water", "balanced_meals"]
        },
        
        description: String,
        
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium"
        }
      }]
    },

    // Meal photos
    mealPhotos: [String],  // Cloudinary URLs

    // Tags for categorization
    tags: [String],

    // Notes
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Indexes for performance
nutritionSchema.index({ user: 1, date: -1 });
nutritionSchema.index({ "meals.type": 1 });
nutritionSchema.index({ tags: 1 });

export default mongoose.model("Nutrition", nutritionSchema);
