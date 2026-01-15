import express from "express";
import {
  logNutrition,
  getNutritionLogs,
  getNutritionById,
  updateNutrition,
  deleteNutrition,
  getNutritionGoals,
  updateNutritionGoals,
  getNutritionInsights,
  createNutritionForClient,
  getClientNutrition
} from "../controllers/nutritionController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| LOG NUTRITION
|--------------------------------------------------------------------------
| Method: POST
| Route: /api/nutrition/log
| Role: User
*/
router.post("/log", protect, logNutrition);

/*
|--------------------------------------------------------------------------
| GET NUTRITION LOGS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/nutrition/logs
| Role: User
*/
router.get("/logs", protect, getNutritionLogs);

/*
|--------------------------------------------------------------------------
| GET NUTRITION DETAILS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/nutrition/:id
| Role: User
*/
router.get("/:id", protect, getNutritionById);

/*
|--------------------------------------------------------------------------
| UPDATE NUTRITION LOG
|--------------------------------------------------------------------------
| Method: PUT
| Route: /api/nutrition/:id
| Role: User
*/
router.put("/:id", protect, updateNutrition);

/*
|--------------------------------------------------------------------------
| DELETE NUTRITION LOG
|--------------------------------------------------------------------------
| Method: DELETE
| Route: /api/nutrition/:id
| Role: User
*/
router.delete("/:id", protect, deleteNutrition);

/*
|--------------------------------------------------------------------------
| GET NUTRITION GOALS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/nutrition/goals
| Role: User
*/
router.get("/goals", protect, getNutritionGoals);

/*
|--------------------------------------------------------------------------
| UPDATE NUTRITION GOALS
|--------------------------------------------------------------------------
| Method: PUT
| Route: /api/nutrition/goals
| Role: User
*/
router.put("/goals", protect, updateNutritionGoals);

/*
|--------------------------------------------------------------------------
| GET NUTRITION INSIGHTS
|--------------------------------------------------------------------------
| Method: GET
| Route: /api/nutrition/insights
| Role: User
*/
router.get("/insights", protect, getNutritionInsights);

/*
|--------------------------------------------------------------------------
| TRAINER NUTRITION MANAGEMENT
|--------------------------------------------------------------------------
| Trainer creates and manages nutrition for clients
*/
router.post("/client/:clientId", protect, createNutritionForClient);
router.get("/client/:clientId", protect, getClientNutrition);

export default router;
