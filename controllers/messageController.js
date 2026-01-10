import Message from "../models/Message.js";

// Send message
export const sendMessage = async (req, res) => {
  const { receiver, text } = req.body;

  if (!receiver || !text) {
    return res.status(400).json({ message: "Receiver and text are required" });
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver,
    text
  });

  res.status(201).json(message);
};

// Get chat between two users
export const getMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
};
