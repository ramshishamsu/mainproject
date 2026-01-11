import express from "express";
import {
  createWorkout,
  getExercises,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getMyWorkouts,
  assignWorkout
} from "../controllers/workoutController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| EXERCISE LIBRARY
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/workouts/exercises
| Role: Public (with auth)
*/
router.get("/exercises", protect, getExercises);

/*
|--------------------------------------------------------------------------
| CREATE WORKOUT LOG
|--------------------------------------------------------------------------
| Method: POST
| Route: /api/workouts
| Role: User
*/
router.post("/", protect, createWorkout);

/*
|--------------------------------------------------------------------------
| GET WORKOUT DETAILS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/workouts/:id
| Role: User/Trainer
*/
router.get("/:id", protect, getWorkoutById);

/*
|--------------------------------------------------------------------------
| UPDATE WORKOUT
|--------------------------------------------------------------------------
| Method: PUT
| Route: /api/workouts/:id
| Role: User
*/
router.put("/:id", protect, updateWorkout);

/*
|--------------------------------------------------------------------------
| DELETE WORKOUT
|--------------------------------------------------------------------------
| Method: DELETE
| Route: /api/workouts/:id
| Role: User
*/
router.delete("/:id", protect, deleteWorkout);

/*
|--------------------------------------------------------------------------
| GET USER WORKOUTS (ENHANCED)
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/workouts/my
| Role: User
*/
router.get("/my", protect, getMyWorkouts);

/*
|--------------------------------------------------------------------------
| ASSIGN WORKOUT (TRAINER)
|--------------------------------------------------------------------------
| Method: POST
| Route: /api/workouts/assign
| Role: Trainer
| Note:
| - No payment check here
| - Trainers can assign workouts freely
*/
router.post(
  "/assign",
  protect,
  assignWorkout
);

export default router;
