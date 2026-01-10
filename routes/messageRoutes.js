import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Send message
router.post("/send", protect, sendMessage);

// Get chat history
router.get("/:userId", protect, getMessages);

export default router;
