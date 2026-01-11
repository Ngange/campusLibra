const BookAudit = require('../models/bookAudit.model');
const logger = require('../config/logger');

/**
 * Get all audit logs with optional filtering
 * Supports filter by: userId, bookId, action, startDate, endDate
 */
const getAuditTrailHandler = async (req, res, next) => {
  try {
    const { userId, bookId, action, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};

    if (userId) {
      filter.performedBy = userId;
    }

    if (bookId) {
      filter.book = bookId;
    }

    if (action) {
      filter.action = action;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        filter.timestamp.$lte = end;
      }
    }

    const auditLogs = await BookAudit.find(filter)
      .populate('book', 'title isbn author')
      .populate('performedBy', 'name email')
      .populate('bookCopy')
      .sort({ timestamp: -1 })
      .limit(500); // Limit to prevent large data transfers

    res.json({
      success: true,
      auditLogs: auditLogs,
      count: auditLogs.length,
    });
  } catch (error) {
    logger.error('Get audit trail error:', error);
    next(error);
  }
};

/**
 * Get audit logs for a specific user
 */
const getAuditLogsByUserHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const auditLogs = await BookAudit.find({ performedBy: userId })
      .populate('book', 'title isbn author')
      .populate('bookCopy')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: auditLogs,
      count: auditLogs.length,
    });
  } catch (error) {
    logger.error('Get audit logs by user error:', error);
    next(error);
  }
};

/**
 * Get audit logs for a specific book
 */
const getAuditLogsByBookHandler = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const auditLogs = await BookAudit.find({ book: bookId })
      .populate('performedBy', 'name email')
      .populate('bookCopy')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: auditLogs,
      count: auditLogs.length,
    });
  } catch (error) {
    logger.error('Get audit logs by book error:', error);
    next(error);
  }
};

/**
 * Create audit log entry (internal use)
 */
const createAuditLogHandler = async (req, res, next) => {
  try {
    const { bookId, bookCopyId, action, details, userId } = req.body;

    const auditLog = new BookAudit({
      book: bookId,
      bookCopy: bookCopyId,
      action,
      performedBy: userId,
      details,
      timestamp: new Date(),
    });

    await auditLog.save();

    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: auditLog,
    });
  } catch (error) {
    logger.error('Create audit log error:', error);
    next(error);
  }
};

module.exports = {
  getAuditTrailHandler,
  getAuditLogsByUserHandler,
  getAuditLogsByBookHandler,
  createAuditLogHandler,
};
