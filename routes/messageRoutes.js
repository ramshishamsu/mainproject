import express from "express";
import {
  sendMessage,
  createConversation,
  getConversations,
  getConversationMessages
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.post("/conversation", protect, createConversation);
router.get("/conversations", protect, getConversations);
router.get("/conversation/:id", protect, getConversationMessages);

export default router;
