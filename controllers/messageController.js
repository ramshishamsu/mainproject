import Message from "../models/Message.js";
import Trainer from "../models/Trainer.js";
import mongoose from "mongoose";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, content } = req.body;

    if (!conversationId || !receiverId || !content?.trim()) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      conversationId,
      content: content.trim()
    });

    await message.populate("sender", "name email");
    await message.populate("receiver", "name email");

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create conversation
export const createConversation = async (req, res) => {
  try {
    const { trainerId } = req.body;

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const trainer = await Trainer.findById(trainerId).populate(
      "userId",
      "name email"
    );

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const conversationId = new mongoose.Types.ObjectId();

    const firstMessage = await Message.create({
      sender: req.user._id,
      receiver: trainer.userId._id,
      conversationId,
      content: "Hi! I'd like to start training with you."
    });

    await firstMessage.populate("sender", "name email");
    await firstMessage.populate("receiver", "name email");

    res.status(201).json({
      _id: conversationId,
      participant: {
        role: "trainer",
        _id: trainer._id,
        userId: trainer.userId,
        name: trainer.userId.name,
        specialization: trainer.specialization || "Fitness Trainer"
      },
      lastMessage: firstMessage
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get conversations - Works for both user and trainer
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate("sender receiver", "name email");

    const map = new Map();

    for (const msg of messages) {
      const id = msg.conversationId.toString();
      if (!map.has(id)) map.set(id, msg);
    }

    const conversations = [];

    for (const msg of map.values()) {
      const otherUser =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

      // Check if other user is a trainer
      const trainer = await Trainer.findOne({ userId: otherUser._id }).populate(
        "userId",
        "name email"
      );

      if (trainer) {
        // USER SIDE - showing trainer
        conversations.push({
          _id: msg.conversationId,
          participant: {
            role: "trainer",
            _id: trainer._id,
            userId: trainer.userId,
            name: trainer.userId.name,
            specialization: trainer.specialization || "Fitness Trainer"
          },
          lastMessage: msg
        });
      } else {
        // TRAINER SIDE - showing client
        conversations.push({
          _id: msg.conversationId,
          participant: {
            role: "user",
            _id: otherUser._id,
            userId: otherUser._id,
            name: otherUser.name
          },
          lastMessage: msg
        });
      }
    }

    res.status(200).json(conversations);
  } catch (error) {
    console.error("❌ getConversations error:", error);
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

// Get messages in conversation
export const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id
    })
      .populate("sender receiver", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};