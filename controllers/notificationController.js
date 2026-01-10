import Notification from "../models/Notification.js";

// create notification (INTERNAL USE)
export const createNotification = async (userId, message) => {
  await Notification.create({ user: userId, message });
};

// get notifications (USER API)
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id });
  res.json(notifications);
};