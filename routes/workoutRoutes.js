import express from "express";
import {
  assignWorkout,
  getMyWorkouts
} from "../controllers/workoutController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ASSIGN WORKOUT
|--------------------------------------------------------------------------
| Method: POST
| Route: /api/workouts
| Role: Trainer
| Note:
| - No payment check here
| - Trainers can assign workouts freely
*/
router.post(
  "/",
  protect,
  assignWorkout
);

/*
|--------------------------------------------------------------------------
| GET MY WORKOUTS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/workouts/my
| Role: User
| Note:
| - Users can view workouts after approval
| - Payment logic handled elsewhere
*/
router.get(
  "/my",
  protect,
  getMyWorkouts
);

export default router;
