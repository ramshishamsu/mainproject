import express from "express";
import { 
  sendMessage, 
  getMessages,
  getConversations,
  getConversationMessages
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Send message
router.post("/", protect, sendMessage);

// Get conversations
router.get("/conversations", protect, getConversations);

// Get conversation messages
router.get("/conversation/:id", protect, getConversationMessages);

// Get chat history (legacy)
router.get("/:userId", protect, getMessages);

export default router;
