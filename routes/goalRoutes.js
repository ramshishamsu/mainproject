import express from "express";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalInsights
} from "../controllers/goalController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Goal CRUD routes
router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:id", getGoalById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

// Goal insights
router.get("/:id/insights", getGoalInsights);

export default router;
