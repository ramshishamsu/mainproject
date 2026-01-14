import Message from "../models/Message.js";

// Send message
export const sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;

  if (!conversationId || !content) {
    return res.status(400).json({ message: "Conversation ID and content are required" });
  }

  const message = await Message.create({
    sender: req.user._id,
    conversationId,
    content
  });

  res.status(201).json(message);
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
          lastMessage: { $last: "$createdAt" },
          participants: { $addToSet: ["$sender", "$receiver"] }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    // Populate trainer information
    const populatedConversations = await Message.populate(conversations, {
      path: 'participants',
      select: 'userId name specialization',
      model: 'User'
    });

    console.log('✅ Conversations fetched:', populatedConversations.length);
    res.status(200).json(populatedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get messages in a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'userId name')
      .sort({ createdAt: 1 });

    console.log('✅ Conversation messages fetched:', messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get chat between two users (legacy)
export const getMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
};
