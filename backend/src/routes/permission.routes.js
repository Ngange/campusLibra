const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const {
  getAllPermissionsHandler,
  getPermissionByIdHandler,
  getPermissionsByCategoryHandler,
  createPermissionHandler,
  updatePermissionHandler,
  deletePermissionHandler,
} = require('../controllers/permission.controller');

// All permission routes require authentication and admin role
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// Get all permissions (with optional filtering by category or name)
router.get('/', getAllPermissionsHandler);

// Get permissions by category
router.get('/category/:category', getPermissionsByCategoryHandler);

// Get single permission by ID
router.get('/:id', getPermissionByIdHandler);

// Create new permission
router.post(
  '/',
  validationMiddleware.validatePermission,
  validationMiddleware.handleValidationErrors,
  createPermissionHandler
);

// Update permission
router.put(
  '/:id',
  validationMiddleware.validatePermissionUpdate,
  validationMiddleware.handleValidationErrors,
  updatePermissionHandler
);

// Delete permission
router.delete('/:id', deletePermissionHandler);

module.exports = router;
