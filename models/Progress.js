import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| PROGRESS SCHEMA - Enhanced for comprehensive tracking
|--------------------------------------------------------------------------
| - Supports multiple measurement types
| - Includes goal tracking and achievements
| - Progress photos and milestones
*/
const progressSchema = new mongoose.Schema({
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

  // Body measurements
  measurements: {
    weight: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    muscleMass: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    arms: { type: Number, min: 0 },
    thighs: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    shoulders: { type: Number, min: 0 },
    calves: { type: Number, min: 0 }
  },

  // Performance metrics
  performance: {
    totalWorkouts: { type: Number, default: 0 },
    totalCaloriesBurned: { type: Number, default: 0 },
    averageHeartRate: { type: Number, min: 40, max: 220 },
    vo2Max: { type: Number, min: 0 },
    flexibility: { type: Number, min: 0, max: 10 },
    endurance: { type: Number, min: 0, max: 10 },
    strength: { type: Number, min: 0, max: 10 }
  },

  // Goals tracking
  goals: [{
    type: {
      type: String,
      enum: ["weight_loss", "weight_gain", "muscle_gain", "endurance", "strength", "flexibility", "body_fat_percentage"],
      required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    targetValue: { type: Number, required: true },
    currentProgress: { type: Number, default: 0, min: 0, max: 100 },
    targetDate: { type: Date, required: true },
    milestones: [{
      value: Number,
      date: Date,
      achieved: { type: Boolean, default: false },
      notes: String
    }],
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // Progress photos
  photos: [{
    type: String,
    required: true
  },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: ["front", "side", "back", "progress"],
      default: "progress"
    },
    notes: String
  }],

  // Achievements and badges
  achievements: [{
    type: {
      type: String,
      enum: ["workout_streak", "calorie_goal", "weight_goal", "muscle_gain", "endurance_milestone", "consistency", "first_workout", "monthly_champion"],
      required: true
    },
    title: String,
    description: String,
    dateEarned: { type: Date, required: true },
    icon: String,
    points: { type: Number, default: 0 }
  }],

  // Progress insights
  insights: {
    weightTrend: {
      type: String,
      enum: ["losing", "gaining", "stable"],
      default: "stable"
    },
    performanceTrend: {
      type: String,
      enum: ["improving", "stable", "declining"],
      default: "stable"
    },
    recommendations: [{
      type: {
        type: String,
        enum: ["increase_intensity", "add_cardio", "focus_strength", "improve_nutrition", "rest_day", "adjust_goals"],
        required: true
      },
      description: String,
      priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
      }
    }]
  },

  // Notes
  notes: { type: String, trim: true }
}, { timestamps: true });

// Indexes for performance
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ "goals.type": 1 });
progressSchema.index({ "goals.isCompleted": 1 });
progressSchema.index({ achievements.type": 1 });

export default mongoose.model("Progress", progressSchema);
