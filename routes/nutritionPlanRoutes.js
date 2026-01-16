import express from "express";
import {
  createNutritionPlan,
  getTrainerNutritionPlans,
  getNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan,
  logNutritionIntake,
  getClientNutritionLogs,
  getNutritionPlanStats,
  createNutritionLogForUser
} from "../controllers/nutritionPlanController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Trainer routes
router.post("/", createNutritionPlan);
router.get("/", getTrainerNutritionPlans);
router.get("/:id", getNutritionPlan);
router.put("/:id", updateNutritionPlan);
router.delete("/:id", deleteNutritionPlan);

// Client logging routes
router.post("/:planId/logs", logNutritionIntake);
router.get("/:planId/logs", getClientNutritionLogs);
router.get("/:planId/stats", getNutritionPlanStats);
router.post("/:planId/trainer-log", createNutritionLogForUser);

export default router;
