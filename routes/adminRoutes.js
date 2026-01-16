import express from "express";
import {
  getAllUsers,
  blockUnblockUser,
  deleteUser,
  getAllTrainers,
  getTrainerDetails,
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
router.get("/trainers/:id", getTrainerDetails);
router.put("/trainers/:id/approve", approveTrainer);
router.put("/trainers/:id/reject", rejectTrainer);

// Verify trainer documents
router.put("/trainers/:trainerId/docs/:docId/verify", verifyTrainerDocument);

// Serve trainer documents (bypass Cloudinary authentication)
router.get("/trainers/:trainerId/docs/:docId/view", async (req, res) => {
  try {
    const { trainerId, docId } = req.params;
    
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const doc = trainer.documents.id(docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    console.log('Serving document:', {
      trainerId,
      docId,
      documentType: doc.type,
      originalUrl: doc.url
    });

    // Set headers to bypass Cloudinary authentication
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Redirect to Cloudinary URL with proper parameters
    res.redirect(302, doc.url);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ message: error.message });
  }
});

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
