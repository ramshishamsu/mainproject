import { Rating, Feedback } from "../models/Rating.js";

/*
|--------------------------------------------------------------------------
| CREATE RATING
|--------------------------------------------------------------------------
| - User rates a trainer
| - Supports 1-5 star rating system
*/
export const createRating = async (req, res) => {
  try {
    const { trainerId, rating, comment } = req.body;

    if (!trainerId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Trainer ID, rating (1-5), and comment are required"
      });
    }

    const newRating = new Rating({
      user: req.user.id,
      trainer: trainerId,
      rating,
      comment,
      date: new Date()
    });

    await newRating.save();

    // Update trainer's average rating
    const Trainer = require("../models/Trainer.js").default;
    const allRatings = await Rating.find({ trainer: trainerId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await Trainer.findByIdAndUpdate(trainerId, { 
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalRatings: allRatings.length
    });

    console.log('✅ Rating created:', { trainerId, rating, comment });
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY RATINGS
|--------------------------------------------------------------------------
| - Get all ratings by current user
*/
export const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user.id })
      .populate('trainer', 'userId.name specialization')
      .sort({ date: -1 });

    console.log('✅ My ratings fetched:', ratings.length);
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE FEEDBACK
|--------------------------------------------------------------------------
| - User provides feedback on services
*/
export const createFeedback = async (req, res) => {
  try {
    const { trainerId, service, rating, comment } = req.body;

    if (!service || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Service type, rating (1-5), and comment are required"
      });
    }

    const newFeedback = new Feedback({
      user: req.user.id,
      trainer: trainerId || null,
      service,
      rating,
      comment,
      date: new Date()
    });

    await newFeedback.save();

    console.log('✅ Feedback created:', { service, rating, comment });
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY FEEDBACK
|--------------------------------------------------------------------------
| - Get all feedback by current user
*/
export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .populate('trainer', 'userId.name specialization')
      .sort({ date: -1 });

    console.log('✅ My feedback fetched:', feedback.length);
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};
