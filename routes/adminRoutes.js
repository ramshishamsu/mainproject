import express from "express";
import {
  getAllUsers,
  blockUnblockUser,
  getAllTrainers,
  approveTrainer,
  rejectTrainer,
  getAllAppointments,
  getAllPayments,
  getAllWithdrawals,
  approveWithdrawals,
  rejectWithdrawal,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  assignPlanToUser
} from "../controllers/adminController.js";
import { getAdminStats } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
| All routes are protected & admin-only
*/
router.use(protect, adminOnly);
router.get("/stats", protect, adminOnly, getAdminStats);
// User management
router.get("/users", getAllUsers);
// Block / Unblock user
router.put("/users/:id/block", blockUnblockUser);

// Trainer management
router.get("/trainers", getAllTrainers);
router.put("/trainers/:id/approve", approveTrainer);
router.put("/trainers/:id/reject", rejectTrainer);

// Appointment monitoring
router.get("/appointments", getAllAppointments);


// Payment monitoring
router.get("/payments", getAllPayments);

// Withdrawal management
router.get("/withdrawals", getAllWithdrawals);

// approve withdrawal
router.put("/withdrawals/:id/approve", approveWithdrawals);

// ✅ reject withdrawal
router.put("/withdrawals/:id/reject", rejectWithdrawal);
// ✅ PLANS ROUTES
router.get("/plans", getPlans);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);
router.post("/assign-plan", assignPlanToUser);

export default router;
