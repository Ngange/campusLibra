const express = require('express');
const {
  getUserFinesHandler,
  getFineByIdHandler,
  payFineHandler,
} = require('../controllers/fine.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const router = express.Router();

// Get current user's fines
router.get('/', authMiddleware, getUserFinesHandler);

// Get specific fine (user can view their own)
router.get('/:id', authMiddleware, getFineByIdHandler);

// Mark fine as paid (librarian only)
router.patch(
  '/:id/pay',
  authMiddleware,
  authorizeRoles('librarian', 'admin'),
  payFineHandler
);

module.exports = router;
