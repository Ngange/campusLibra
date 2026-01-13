const notificationService = require('../services/notification.service');
const User = require('../models/user.model');
const Role = require('../models/role.model');

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

// Send notification to user and admins/librarians with different messages
const emitNotificationWithStaff = async (
  userId,
  userTitle,
  userMessage,
  staffTitle,
  staffMessage,
  type,
  relatedId = null,
  relatedModel = null
) => {
  try {
    // Send notification to the user who performed the action
    await emitNotification(
      userId,
      userTitle,
      userMessage,
      type,
      relatedId,
      relatedModel
    );

    // Find admin and librarian roles
    const adminRole = await Role.findOne({ name: 'admin' });
    const librarianRole = await Role.findOne({ name: 'librarian' });

    const roleIds = [adminRole?._id, librarianRole?._id].filter(Boolean);

    if (roleIds.length > 0) {
      // Find all admins and librarians
      const staffUsers = await User.find({
        role: { $in: roleIds },
        _id: { $ne: userId }, // Don't send to self if they are admin/librarian
      }).select('_id');

      // Send notifications to all staff members
      for (const staff of staffUsers) {
        await emitNotification(
          staff._id,
          staffTitle,
          staffMessage,
          type,
          relatedId,
          relatedModel
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to emit notifications to staff:', error.message);
    // Don't throw - we don't want to fail the operation if notifications fail
    return false;
  }
};

module.exports = { emitNotification, emitNotificationWithStaff };
