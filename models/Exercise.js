import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| EXERCISE LIBRARY SCHEMA
|--------------------------------------------------------------------------
| - Comprehensive exercise database
| - Categorized by muscle groups and equipment
| - Includes instructions and difficulty levels
*/
const exerciseSchema = new mongoose.Schema(
  {
    // Basic exercise info
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    // Exercise categorization
    category: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "balance", "core", "plyometric", "olympic", "functional"],
      required: true
    },

    subcategory: {
      type: String,
      enum: [
        // Strength
        "chest", "back", "shoulders", "biceps", "triceps", "legs", "calves", "abs",
        // Cardio
        "running", "cycling", "swimming", "jumping", "rowing",
        // Flexibility
        "stretching", "yoga", "pilates",
        // Balance
        "stability", "balance_board",
        // Core
        "plank", "crunch", "leg_raise", "russian_twist",
        // Other
        "full_body", "warmup", "cooldown"
      ]
    },

    // Target muscle groups
    muscleGroups: [{
      type: String,
      enum: [
        "chest", "back", "shoulders", "biceps", "triceps", "forearms",
        "quadriceps", "hamstrings", "calves", "glutes", "abs",
        "obliques", "lats", "traps", "deltoids"
      ]
    }],

    // Exercise details
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    equipment: [{
      type: String,
      enum: [
        "none", "dumbbells", "barbell", "kettlebells", "resistance_bands",
        "treadmill", "elliptical", "stationary_bike", "rowing_machine",
        "cable_machine", "leg_press", "bench_press", "squat_rack",
        "pull_up_bar", "dip_bars", "medicine_ball", "foam_roller",
        "jump_rope", "stability_ball", "yoga_mat", "resistance_machine"
      ]
    }],

    // Movement patterns
    movementPattern: {
      type: String,
      enum: ["push", "pull", "squat", "hinge", "lunge", "rotate", "gait", "carry"]
    },

    // Exercise instructions
    instructions: [{
      step: Number,
      instruction: String,
      image: String  // URL to instruction image
    }],

    // Video demonstration
    videoUrl: String,

    // Exercise metrics
    metrics: {
      repsBased: {
        type: Boolean,
        default: true
      },
      timeBased: {
        type: Boolean,
        default: false
      },
      distanceBased: {
        type: Boolean,
        default: false
      },
      weightBased: {
        type: Boolean,
        default: false
      }
    },

    // Safety and tips
    safetyNotes: [String],
    tips: [String],

    // Exercise variations
    variations: [{
      name: String,
      description: String,
      difficulty: String
    }],

    // Creator information
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    // Popularity and ratings
    usageCount: {
      type: Number,
      default: 0
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes for performance
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ muscleGroups: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ name: "text", description: "text" });

export default mongoose.model("Exercise", exerciseSchema);
