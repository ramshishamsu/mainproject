import mongoose from "mongoose";
import {
  MEAL_TYPES,
  MEAL_STATUS,
  MOODS,
  ENERGY_LEVELS,
  GOAL_TYPES
} from "../constants/nutritionEnums.js";

/* =========================
   Meal Log Schema
========================= */
const mealLogSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: MEAL_TYPES,
    required: true,
  },
  status: {
    type: String,
    enum: MEAL_STATUS,
    default: "skipped",
  },
  actualCalories: Number,
  actualProtein: Number,
  actualCarbs: Number,
  actualFat: Number,
});

/* =========================
   Daily Log Schema
========================= */
const dailyLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  day: Number,
  meals: [mealLogSchema],
  totalConsumedCalories: Number,
  adherenceScore: Number,
  notes: String,
  weight: Number,
  mood: {
    type: String,
    enum: MOODS,
  },
  energyLevel: {
    type: String,
    enum: ENERGY_LEVELS,
  },
  createdByTrainer: {
    type: Boolean,
    default: false,
  },
});

/* =========================
   Planned Meal Schema
========================= */
const plannedMealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: MEAL_TYPES,
    required: true,
  },
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  instructions: String,
});

/* =========================
   Daily Plan Schema
========================= */
const dailyPlanSchema = new mongoose.Schema({
  day: Number,
  meals: [plannedMealSchema],
});

/* =========================
   Nutrition Plan Schema
========================= */
const nutritionPlanSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    description: String,

    duration: Number,
    startDate: Date,
    endDate: Date,

    goals: {
      goalType: {
        type: String,
        enum: GOAL_TYPES,
      },
      dailyCalories: Number,
    },

    dailyPlans: [dailyPlanSchema],

    /* 🔥 LOGS STORED HERE (ACADEMIC REQUIREMENT) */
    clientLogs: [dailyLogSchema],

    statistics: {
      totalDays: Number,
      completedDays: Number,
      adherenceRate: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("NutritionPlan", nutritionPlanSchema);
