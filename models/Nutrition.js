import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mealType: {
      type: String,
      required: true
    },
    foodItems: {
      type: String,
      required: true
    },
    calories: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Nutrition", nutritionSchema);
