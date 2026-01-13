const BookAudit = require('../models/bookAudit.model');
const logger = require('../config/logger');

const createBookAudit = async (
  bookId,
  bookCopyId,
  action,
  performedBy,
  details = {}
) => {
  return await BookAudit.create({
    book: bookId,
    bookCopy: bookCopyId,
    action,
    performedBy,
    details,
  });
};

/**
 * Log a user audit event
 * @param {string} action - Action type (e.g., 'USER_BLOCKED', 'USER_UNBLOCKED', 'USER_UPDATED')
 * @param {string} userId - ID of user performing the action
 * @param {string} targetUserId - ID of user being acted upon
 * @param {object} details - Additional details about the action
 */
const logUserAuditEvent = async (
  action,
  userId,
  targetUserId,
  details = {}
) => {
  try {
    const auditLog = new BookAudit({
      book: null, // User events don't reference books
      bookCopy: null,
      action: action,
      performedBy: userId,
      details: {
        targetUser: targetUserId,
        eventType: 'USER_MANAGEMENT',
        ...details,
      },
    });

    await auditLog.save();
    logger.info(
      `Audit log created: ${action} by user ${userId} on user ${targetUserId}`
    );
  } catch (error) {
    logger.error('Failed to log user audit event:', error);
    // Don't throw - audit logging failure shouldn't break the main action
  }
};

/**
 * Log a system setting change audit event
 * @param {string} settingKey - Setting key that was changed
 * @param {any} oldValue - Previous setting value
 * @param {any} newValue - New setting value
 * @param {string} userId - ID of user performing the action
 * @param {object} details - Additional details about the action
 */
const logSettingAuditEvent = async (
  settingKey,
  oldValue,
  newValue,
  userId,
  details = {}
) => {
  try {
    const auditLog = new BookAudit({
      book: null, // Setting events don't reference books
      bookCopy: null,
      action: 'SETTING_UPDATED',
      performedBy: userId,
      details: {
        settingKey,
        oldValue,
        newValue,
        eventType: 'SYSTEM_SETTINGS',
        ...details,
      },
    });

    await auditLog.save();
    logger.info(
      `Audit log created: SETTING_UPDATED for key ${settingKey} by user ${userId}`
    );
  } catch (error) {
    logger.error('Failed to log setting audit event:', error);
    // Don't throw - audit logging failure shouldn't break the main action
  }
};

module.exports = { createBookAudit, logUserAuditEvent, logSettingAuditEvent };
