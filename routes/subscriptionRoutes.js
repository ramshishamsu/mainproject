import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {  getMySubscription} from "../controllers/subscriptionController.js";

const router = express.Router();

// User subscribes to a plan
router.get("/my", protect, getMySubscription);

export default router;
