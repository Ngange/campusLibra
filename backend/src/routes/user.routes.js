const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const {
  validateUserUpdate,
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users - librarians can view, admins can view
router.get('/', authorizePermission('user_view', 'user_manage'), getAllUsers);

// Get user by ID - librarians can view, admins can view
router.get(
  '/:id',
  validateMongoId,
  handleValidationErrors,
  authorizePermission('user_view', 'user_manage'),
  getUserById
);

// Admin-only routes for modifying users
router.put(
  '/:id',
  validateMongoId,
  validateUserUpdate,
  handleValidationErrors,
  authorizeRoles('admin'),
  updateUser
);
router.delete(
  '/:id',
  validateMongoId,
  handleValidationErrors,
  authorizeRoles('admin'),
  deleteUser
);
router.patch(
  '/:id/block',
  validateMongoId,
  handleValidationErrors,
  authorizePermission('user_manage'),
  blockUser
);
router.patch(
  '/:id/unblock',
  validateMongoId,
  handleValidationErrors,
  authorizePermission('user_manage'),
  unblockUser
);

module.exports = router;
