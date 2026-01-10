import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createPlan,
  getPlans,
  getPlanById
} from "../controllers/planController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PLAN ROUTES
|--------------------------------------------------------------------------
*/

// ✅ GET ALL PLANS (USER + ADMIN)
router.get("/", getPlans);

// ✅ GET SINGLE PLAN (CHECKOUT)
router.get("/:id", getPlanById);

// ✅ CREATE PLAN (ADMIN ONLY)
router.post("/", protect, adminOnly, createPlan);

export default router;
