const notificationService = require('../services/notification.service');
const Notification = require('../models/notification.model');

// Get notifications with admin scopes support
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    // Determine scope: admins default to 'all', librarians to 'role', others to 'user'
    const scopeParam = (req.query.scope || '').toString().toLowerCase();
    let scope;
    if (scopeParam) {
      scope = scopeParam;
    } else if (role === 'admin') {
      scope = 'all';
    } else if (role === 'librarian') {
      scope = 'role';
    } else {
      scope = 'user';
    }

    let notifications;
    if (role === 'admin' || role === 'librarian') {
      if (scope === 'all' && role === 'admin') {
        // Only admins can see all notifications
        notifications = await notificationService.getAllNotifications(
          page,
          limit
        );
      } else if (scope === 'role') {
        // Role-relevant types for admins/librarians: use enum from model
        const typeEnum = Notification.schema.path('type').options.enum || [];
        notifications = await notificationService.getNotificationsByTypes(
          typeEnum,
          page,
          limit
        );
      } else {
        // scope === 'user'
        notifications = await notificationService.getUserNotifications(
          userId,
          page,
          limit
        );
      }
    } else {
      // Regular members: always own notifications
      notifications = await notificationService.getUserNotifications(
        userId,
        page,
        limit
      );
    }

    const unreadCount = await notificationService.getUnreadCount(userId);
    res.json({ success: true, notifications, unreadCount, scope });
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

// Mark a notification as unread for the current user
const markAsUnread = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.markAsUnread(id, userId);
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

module.exports = { getUserNotifications, markAsRead, markAsUnread };
