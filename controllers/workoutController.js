import Workout from "../models/Workout.js";
import Trainer from "../models/Trainer.js";

/*
|--------------------------------------------------------------------------
| ASSIGN WORKOUT (TRAINER)
|--------------------------------------------------------------------------
| - Trainer assigns workout to a user
| - Payment is NOT checked here
| - Trainers prepare workouts as part of service
*/
export const assignWorkout = async (req, res) => {
  try {
    const { user, exercise, sets, reps, calories } = req.body;

    if (!user || !exercise) {
      return res.status(400).json({
        message: "User and exercise are required"
      });
    }

    // Find trainer profile using logged-in trainer email
    const trainer = await Trainer.findOne({ email: req.user.email });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer profile not found"
      });
    }

    const workout = await Workout.create({
      user,
      trainer: trainer._id,
      exercise,
      sets,
      reps,
      calories
    });

    res.status(201).json({
      message: "Workout assigned successfully",
      workout
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER WORKOUTS
|--------------------------------------------------------------------------
| - Logged-in user can view assigned workouts
| - Payment is NOT checked here (Option 1)
*/
export const getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id
    }).populate("trainer", "name specialization");

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
