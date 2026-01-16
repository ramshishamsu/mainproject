import mongoose from "mongoose";

const nutritionPlanSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    duration: {
      type: Number, // in days
      required: true,
      default: 7
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active"
    },
    // Daily meal plans
    dailyPlans: [
      {
        day: {
          type: Number,
          required: true,
          min: 1
        },
        meals: [
          {
            mealType: {
              type: String,
              enum: ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"],
              required: true
            },
            name: {
              type: String,
              required: true
            },
            description: {
              type: String
            },
            calories: {
              type: Number,
              required: true
            },
            protein: {
              type: Number,
              required: true
            },
            carbs: {
              type: Number,
              required: true
            },
            fat: {
              type: Number,
              required: true
            },
            fiber: {
              type: Number
            },
            sugar: {
              type: Number
            },
            sodium: {
              type: Number
            },
            ingredients: [{
              name: String,
              quantity: String,
              unit: String
            }],
            instructions: {
              type: String
            },
            prepTime: {
              type: Number // in minutes
            },
            difficulty: {
              type: String,
              enum: ["easy", "medium", "hard"],
              default: "easy"
            },
            imageUrl: {
              type: String
            }
          }
        ],
        totalCalories: {
          type: Number,
          required: true
        },
        totalProtein: {
          type: Number,
          required: true
        },
        totalCarbs: {
          type: Number,
          required: true
        },
        totalFat: {
          type: Number,
          required: true
        }
      }
    ],
    // Nutrition goals
    goals: {
      dailyCalories: {
        type: Number,
        required: true
      },
      dailyProtein: {
        type: Number,
        required: true
      },
      dailyCarbs: {
        type: Number,
        required: true
      },
      dailyFat: {
        type: Number,
        required: true
      },
      targetWeight: {
        type: Number
      },
      goalType: {
        type: String,
        enum: ["weight_loss", "muscle_gain", "maintenance", "performance"],
        required: true
      }
    },
    // Client adherence tracking
    clientLogs: [
      {
        date: {
          type: Date,
          required: true
        },
        day: {
          type: Number,
          required: true
        },
        meals: [
          {
            mealType: {
              type: String,
              enum: ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"],
              required: true
            },
            status: {
              type: String,
              enum: ["completed", "skipped", "partial", "substituted"],
              required: true
            },
            notes: {
              type: String
            },
            actualCalories: {
              type: Number
            },
            actualProtein: {
              type: Number
            },
            actualCarbs: {
              type: Number
            },
            actualFat: {
              type: Number
            },
            imageUrl: {
              type: String
            },
            loggedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        totalConsumedCalories: {
          type: Number,
          default: 0
        },
        adherenceScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },
        notes: {
          type: String
        },
        weight: {
          type: Number
        },
        mood: {
          type: String,
          enum: ["excellent", "good", "average", "poor", "terrible"]
        },
        energyLevel: {
          type: String,
          enum: ["very_high", "high", "medium", "low", "very_low"]
        }
      }
    ],
    // Plan statistics
    statistics: {
      totalDays: {
        type: Number,
        default: 0
      },
      completedDays: {
        type: Number,
        default: 0
      },
      adherenceRate: {
        type: Number,
        default: 0
      },
      averageCalories: {
        type: Number,
        default: 0
      },
      averageProtein: {
        type: Number,
        default: 0
      },
      averageCarbs: {
        type: Number,
        default: 0
      },
      averageFat: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
nutritionPlanSchema.index({ clientId: 1, status: 1 });
nutritionPlanSchema.index({ trainerId: 1 });
nutritionPlanSchema.index({ "clientLogs.date": 1 });

export default mongoose.model("NutritionPlan", nutritionPlanSchema);
