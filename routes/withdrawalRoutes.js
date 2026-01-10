import express from "express";
import { requestWithdrawal } from "../controllers/withdrawalController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


/*
|--------------------------------------------------------------------------
| TRAINER REQUESTS WITHDRAWAL
|--------------------------------------------------------------------------
| Route: POST /api/withdrawals
*/
router.post("/", protect, requestWithdrawal);

export default router;

