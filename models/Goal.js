import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| GOAL SCHEMA - SMART goal tracking
|--------------------------------------------------------------------------
| - Supports various goal types
| - Includes milestones and progress tracking
| - Achievement system integration
*/
const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["weight_loss", "weight_gain", "muscle_gain", "endurance", "strength", "flexibility", "body_fat_percentage", "custom"],
      required: true
  },

  targetValue: {
    type: Number,
    required: true
  },

  currentProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  targetDate: {
    type: Date,
    required: true
  },

  milestones: [{
    title: String,
    description: String,
    targetValue: Number,
    achieved: {
      type: Boolean,
      default: false
    },
    achievedDate: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],

  isCompleted: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date
  },

  // Goal settings
  settings: {
    reminders: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ["daily", "weekly", "biweekly"], 
        default: "daily" 
      },
      time: { type: String, default: "09:00" },
      daysBefore: { type: Number, default: 7 }
    },
    
    notifications: {
      milestone: { type: Boolean, default: true },
      progress: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    }
  },

  // Tracking data
  tracking: {
    weeklyProgress: [{
      week: Number,
      progressValue: Number,
      notes: String,
      date: Date
    }],
    
    dailyCheckins: [{
      date: Date,
      completed: { type: Boolean, default: false },
      notes: String,
      value: Number
    }]
  },

  // Motivation
  motivation: {
    type: String,
    enum: ["health", "appearance", "performance", "competition", "personal"],
    default: "health"
  },

  // Rewards and achievements
  rewards: {
    points: { type: Number, default: 0 },
    badges: [{
      type: String,
      title: String,
      description: String,
      icon: String,
      dateEarned: Date,
      points: Number
    }]
  },

  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Indexes for performance
goalSchema.index({ user: 1, "type": 1 });
goalSchema.index({ "isCompleted": 1 });
goalSchema.index({ "targetDate": 1 });
goalSchema.index({ "isActive": 1 });

export default mongoose.model("Goal", goalSchema);
