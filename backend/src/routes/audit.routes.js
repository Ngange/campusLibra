const express = require('express');
const {
  getAuditTrailHandler,
  getAuditLogsByUserHandler,
  getAuditLogsByBookHandler,
  createAuditLogHandler,
} = require('../controllers/audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const {
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get audit trail with optional filters - admin only
router.get('/', authorizePermission('system_manage'), getAuditTrailHandler);

// Get audit logs by user ID
router.get(
  '/user/:userId',
  validateMongoId,
  handleValidationErrors,
  authorizePermission('system_manage'),
  getAuditLogsByUserHandler
);

// Get audit logs by book ID
router.get(
  '/book/:bookId',
  validateMongoId,
  handleValidationErrors,
  authorizePermission('system_manage'),
  getAuditLogsByBookHandler
);

// Create audit log (internal use)
router.post('/', authorizePermission('system_manage'), createAuditLogHandler);

module.exports = router;
