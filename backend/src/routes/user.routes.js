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
const {
  validateUserUpdate,
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// All routes require authentication + admin role
router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', getAllUsers);
router.get('/:id', validateMongoId, handleValidationErrors, getUserById);
router.put(
  '/:id',
  validateMongoId,
  validateUserUpdate,
  handleValidationErrors,
  updateUser
);
router.delete('/:id', validateMongoId, handleValidationErrors, deleteUser);
router.patch('/:id/block', validateMongoId, handleValidationErrors, blockUser);
router.patch(
  '/:id/unblock',
  validateMongoId,
  handleValidationErrors,
  unblockUser
);

module.exports = router;
