import express from "express";
import {
  getAllUsers,
  blockUnblockUser,
  deleteUser,
  getAllTrainers,
  approveTrainer,
  rejectTrainer,
  getAllAppointments,
  resolveDispute,
  getAllPayments,
  processRefund,
  getAllWithdrawals,
  approveWithdrawals,
  rejectWithdrawals,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  assignPlanToUser,
  getUserActivity,
  generateReports,
  getAdminStats,
  verifyTrainerDocument
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/public-trainers", getAllTrainers);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
| All routes below are protected & admin-only
|--------------------------------------------------------------------------
*/
router.use(protect, adminOnly);

// Dashboard
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/block", blockUnblockUser);
router.delete("/users/:id", deleteUser);

// Trainer management
router.get("/trainers", getAllTrainers);
router.put("/trainers/:id/approve", approveTrainer);
router.put("/trainers/:id/reject", rejectTrainer);

// Verify trainer documents
router.put("/trainers/:trainerId/docs/:docId/verify", verifyTrainerDocument);

// Appointment monitoring
router.get("/appointments", getAllAppointments);
router.post("/appointments/:id/resolve-dispute", resolveDispute);

// Payment monitoring
router.get("/payments", getAllPayments);
router.post("/payments/:id/refund", processRefund);

// Withdrawal management
router.get("/withdrawals", getAllWithdrawals);
router.put("/withdrawals/:id/approve", approveWithdrawals);
router.put("/withdrawals/:id/reject", rejectWithdrawals);

// Plan management
router.get("/plans", getPlans);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);
router.post("/assign-plan", assignPlanToUser);

// User activity monitoring
router.get("/user-activity", getUserActivity);

// Reports
router.get("/reports", generateReports);

export default router;
