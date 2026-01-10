import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| WORKOUT SCHEMA
|--------------------------------------------------------------------------
| - Each workout is assigned by a trainer
| - Each workout belongs to a user
*/
const workoutSchema = new mongoose.Schema(
  {
    // User who performs the workout
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Trainer who assigned the workout
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true
    },

    // Workout details
    exercise: {
      type: String,
      required: true
    },
    sets: Number,
    reps: Number,
    calories: Number,

    // Assignment date
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Workout", workoutSchema);
