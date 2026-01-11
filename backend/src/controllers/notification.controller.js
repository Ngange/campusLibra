const notificationService = require('../services/notification.service');

// Get notifications for current user with pagination
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const notifications = await notificationService.getUserNotifications(
      userId,
      page,
      limit
    );
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// Mark a notification as read for the current user
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await notificationService.getUnreadCount(userId);
    res.json({ success: true, notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserNotifications, markAsRead };
