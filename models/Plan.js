import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| PLAN SCHEMA (Created by Admin)
|--------------------------------------------------------------------------
| - Defines subscription plans
| - Used by users for monthly payments
*/

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    price: {
      type: Number,
      required: true
    },

    duration: {
      type: Number, // in months
      required: true
    },

    features: {
      type: [String],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
