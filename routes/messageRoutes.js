import express from "express";
import {
  sendMessage,
  createConversation,
  getConversations,
  getConversationMessages
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create conversation
router.post("/conversation", protect, createConversation);

// Send message
router.post("/", protect, sendMessage);

// Get conversations
router.get("/conversations", protect, getConversations);

// Get conversation messages
router.get("/conversation/:id", protect, getConversationMessages);

export default router;