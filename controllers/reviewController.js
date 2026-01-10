import Review from "../models/Review.js";
import Trainer from "../models/Trainer.js";

/*
|--------------------------------------------------------------------------
| ADD REVIEW (USER)
|--------------------------------------------------------------------------
*/
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const trainerId = req.params.trainerId;

    // prevent duplicate review
    const alreadyReviewed = await Review.findOne({
      trainer: trainerId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this trainer"
      });
    }

    const review = await Review.create({
      trainer: trainerId,
      user: req.user._id,
      rating,
      comment
    });

    // update trainer rating
    const reviews = await Review.find({ trainer: trainerId });
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Trainer.findByIdAndUpdate(trainerId, {
      rating: avg.toFixed(1),
      numReviews: reviews.length
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
