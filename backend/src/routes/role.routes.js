const express = require('express');
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/role.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const {
  validateRole,
  validateRoleUpdate,
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// Only admins can manage roles
router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', getAllRoles);
router.get('/:id', validateMongoId, handleValidationErrors, getRoleById);
router.post('/', validateRole, handleValidationErrors, createRole);
router.put(
  '/:id',
  validateMongoId,
  validateRoleUpdate,
  handleValidationErrors,
  updateRole
);
router.delete('/:id', validateMongoId, handleValidationErrors, deleteRole);

module.exports = router;
