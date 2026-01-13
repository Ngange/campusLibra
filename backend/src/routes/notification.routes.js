const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  markAsUnread,
} = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', getUserNotifications);
router.patch('/:id/read', validateMongoId, handleValidationErrors, markAsRead);
router.patch(
  '/:id/unread',
  validateMongoId,
  handleValidationErrors,
  markAsUnread
);

module.exports = router;
