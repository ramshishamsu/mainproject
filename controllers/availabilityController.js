import Availability from "../models/Availability.js";
import Trainer from "../models/Trainer.js";

/*
|--------------------------------------------------------------------------
| CREATE AVAILABILITY (TRAINER)
|--------------------------------------------------------------------------
*/
export const createAvailability = async (req, res) => {
  try {
    // find trainer profile using logged-in user email
    const trainer = await Trainer.findOne({ email: req.user.email });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer profile not found"
      });
    }

    const availability = await Availability.create({
      trainer: trainer._id,
      day: req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });

    res.status(201).json({
      message: "Availability added",
      availability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET AVAILABILITY BY TRAINER ID (USER)
|--------------------------------------------------------------------------
*/
export const getAvailabilityByTrainer = async (req, res) => {
  try {
    const availability = await Availability.find({
      trainer: req.params.trainerId
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
