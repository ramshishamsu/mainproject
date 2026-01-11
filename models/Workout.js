import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| WORKOUT SCHEMA - Enhanced for comprehensive fitness tracking
|--------------------------------------------------------------------------
| - Each workout is assigned by a trainer or created by user
| - Supports multiple exercises with detailed tracking
| - Includes difficulty levels and duration tracking
*/
const workoutSchema = new mongoose.Schema(
  {
    // User who performs the workout
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Trainer who assigned the workout (optional)
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer"
    },

    // Workout details
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    // Workout type and difficulty
    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "hiit", "sports", "other"],
      default: "other"
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    // Multiple exercises per workout
    exercises: [{
      name: {
        type: String,
        required: true
      },
      category: {
        type: String,
        enum: ["strength", "cardio", "flexibility", "balance", "core", "other"]
      },
      sets: {
        type: Number,
        min: 0,
        default: 0
      },
      reps: {
        type: Number,
        min: 0,
        default: 0
      },
      weight: {
        type: Number,
        min: 0,
        default: 0  // in kg
      },
      duration: {
        type: Number,
        min: 0,
        default: 0  // in minutes
      },
      distance: {
        type: Number,
        min: 0,
        default: 0  // in km for cardio
      },
      calories: {
        type: Number,
        min: 0,
        default: 0
      },
      notes: {
        type: String,
        trim: true
      },
      restTime: {
        type: Number,
        default: 60  // seconds between sets
      }
    }],

    // Workout totals
    totalDuration: {
      type: Number,
      default: 0  // total minutes
    },

    totalCalories: {
      type: Number,
      default: 0
    },

    // Workout status
    completed: {
      type: Boolean,
      default: false
    },

    // Assignment date
    date: {
      type: Date,
      default: Date.now
    },

    // User's workout plan reference
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan"
    }
  },
  { timestamps: true }
);

// Indexes for performance
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ category: 1 });
workoutSchema.index({ completed: 1 });

export default mongoose.model("Workout", workoutSchema);
