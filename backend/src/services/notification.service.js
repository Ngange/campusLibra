const Notification = require('../models/notification.model');

// Main function: create notification and  emit via socket (later)
const createNotification = async (
  userId,
  title,
  message,
  type,
  relatedId = null,
  relatedModel = null
) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    relatedId,
    relatedModel,
  });

  // TODO: Emit via Socket.IO (we'll add this later)
  // For now, just store in DB

  return notification;
};

// Helper: Mark as read
const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

// Helper: Get unread count
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, isRead: false });
};

// Helper: Get user's notifications
const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedId'); // populate related data
};

module.exports = {
  createNotification,
  markAsRead,
  getUnreadCount,
  getUserNotifications,
};
