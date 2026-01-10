const express = require('express');
const {
  getUserFinesHandler,
  getFineByIdHandler,
  payFineHandler,
} = require('../controllers/fine.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const {
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// Get current user's fines
router.get('/', authMiddleware, getUserFinesHandler);

// Get specific fine (user can view their own)
router.get(
  '/:id',
  authMiddleware,
  validateMongoId,
  handleValidationErrors,
  getFineByIdHandler
);

// Mark fine as paid (librarian only)
router.patch(
  '/:id/pay',
  authMiddleware,
  authorizeRoles('librarian', 'admin'),
  validateMongoId,
  handleValidationErrors,
  payFineHandler
);

module.exports = router;
