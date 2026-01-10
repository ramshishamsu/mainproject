import Progress from "../models/Progress.js";

// Add progress
export const addProgress = async (req, res) => {
  const progress = await Progress.create({
    user: req.user._id,
    weight: req.body.weight,
    bodyFat: req.body.bodyFat,
    notes: req.body.notes
  });

  res.status(201).json(progress);
};

// Get user progress
export const getProgress = async (req, res) => {
  const progress = await Progress.find({ user: req.user._id });
  res.json(progress);
};
