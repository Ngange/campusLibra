const notificationService = require('../services/notification.service');

const emitNotification = async (
  userId,
  title,
  message,
  type,
  relatedId = null,
  relatedModel = null
) => {
  try {
    // Create notification in database
    const notification = await notificationService.createNotification(
      userId,
      title,
      message,
      type,
      relatedId,
      relatedModel
    );

    // Emit via Socket.IO if available
    if (typeof global.emitNotification === 'function') {
      global.emitNotification(userId, notification._id);
    }

    return notification;
  } catch (error) {
    console.error('Failed to emit notification:', error.message);
    throw error;
  }
};

module.exports = { emitNotification };
