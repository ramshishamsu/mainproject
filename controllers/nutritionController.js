import Nutrition from "../models/Nutrition.js";

// Add nutrition
export const addNutrition = async (req, res) => {
  const nutrition = await Nutrition.create({
    user: req.user._id,
    mealType: req.body.mealType,
    foodItems: req.body.foodItems,
    calories: req.body.calories
  });

  res.status(201).json(nutrition);
};

// Get user nutrition history
export const getMyNutrition = async (req, res) => {
  const nutrition = await Nutrition.find({ user: req.user._id });
  res.json(nutrition);
};
