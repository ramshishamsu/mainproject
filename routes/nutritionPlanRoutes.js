import express from "express";
import {
  createNutritionPlan,
  getNutritionPlans,
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

// Test route
router.get("/test", (req, res) => {
  console.log("Nutrition plan test route hit!");
  res.json({ message: "Nutrition plan routes working!" });
});

// Apply authentication middleware to all routes
router.use(protect);

// Universal routes - work for both trainers and users
router.get("/", (req, res) => {
  console.log("GET /nutrition-plans hit by user:", req.user._id);
  getNutritionPlans(req, res);
});

router.get("/:id", (req, res) => {
  console.log("GET /nutrition-plans/:id hit:", req.params.id);
  getNutritionPlan(req, res);
});

// Trainer-only routes
router.post("/", createNutritionPlan);
router.put("/:id", updateNutritionPlan);
router.delete("/:id", deleteNutritionPlan);

// Client logging routes
router.post("/:planId/logs", logNutritionIntake);
router.get("/:planId/logs", getClientNutritionLogs);
router.get("/:planId/stats", getNutritionPlanStats);
router.post("/:planId/trainer-log", createNutritionLogForUser);

export default router;
