import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| RATING SCHEMA
|--------------------------------------------------------------------------
| - User ratings for trainers
| - 1-5 star rating system
| - Comments and feedback
*/
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

/*
|--------------------------------------------------------------------------
| FEEDBACK SCHEMA
|--------------------------------------------------------------------------
| - User feedback on services
| - General feedback system
*/
const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },
    service: {
      type: String,
      required: true,
      enum: ["training", "nutrition", "workout", "appointment", "payment", "general"]
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export { Rating, Feedback };
