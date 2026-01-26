import Message from "../models/Message.js";
import Trainer from "../models/Trainer.js";
import mongoose from "mongoose";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, receiverId } = req.body;

    if (!conversationId || !content || !receiverId) {
      return res.status(400).json({ 
        success: false,
        message: "Conversation ID, receiver ID, and content are required" 
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      conversationId,
      content
    });

    // Populate sender info for response
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');

    console.log('✅ Message sent:', message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create new conversation with trainer
export const createConversation = async (req, res) => {
  try {
    const { trainerId } = req.body;

    if (!trainerId) {
      return res.status(400).json({ 
        success: false,
        message: "Trainer ID is required" 
      });
    }

    // Check if trainer exists
    const trainer = await Trainer.findById(trainerId).populate('userId', 'name email');
    if (!trainer) {
      return res.status(404).json({ 
        success: false,
        message: "Trainer not found" 
      });
    }

    // Create conversation ID
    const conversationId = new mongoose.Types.ObjectId();

    // Create welcome message
    const welcomeMessage = await Message.create({
      sender: req.user._id,
      receiver: trainer.userId._id,
      conversationId,
      content: "Hi! I'm interested in your training services."
    });

    await welcomeMessage.populate('sender', 'name email');
    await welcomeMessage.populate('receiver', 'name email');

    const conversation = {
      _id: conversationId,
      trainer: {
        _id: trainer._id,
        userId: trainer.userId,
        name: trainer.userId.name,
        specialization: trainer.specialization
      },
      lastMessage: welcomeMessage,
      createdAt: new Date()
    };

    console.log('✅ Conversation created:', conversationId);
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get conversations for user
export const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $last: "$$ROOT" },
          participants: { $addToSet: ["$sender", "$receiver"] }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    // Get detailed conversation info
    const populatedConversations = [];
    
    for (const conv of conversations) {
      // Find the trainer in this conversation
      const otherUserId = conv.participants.find(id => id.toString() !== req.user._id.toString());
      
      if (otherUserId) {
        const trainer = await Trainer.findOne({ userId: otherUserId }).populate('userId', 'name email');
        
        if (trainer) {
          populatedConversations.push({
            _id: conv._id,
            trainer: {
              _id: trainer._id,
              userId: trainer.userId,
              name: trainer.userId.name,
              specialization: trainer.specialization
            },
            lastMessage: conv.lastMessage,
            createdAt: conv.lastMessage.createdAt
          });
        }
      }
    }

    console.log('✅ Conversations fetched:', populatedConversations.length);
    res.status(200).json(populatedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get messages in a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const messages = await Message.find({ conversationId: id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    console.log('✅ Conversation messages fetched:', messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get chat between two users (legacy)
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: error.message });
  }
};