const express = require('express');

const {
  borrowBookHandler,
  returnBookHandler,
  getBorrows,
} = require('../controllers/borrow.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const {
  validateBorrow,
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// Member borrows a book
router.post(
  '/',
  authMiddleware,
  authorizeRoles('member'), // Only members can initiate borrows
  validateBorrow,
  handleValidationErrors,
  borrowBookHandler
);

//  Librarian processes return
router.patch(
  '/:id/return',
  authMiddleware,
  authorizeRoles('librarian', 'admin'), // Only staff can process returns
  validateMongoId,
  handleValidationErrors,
  returnBookHandler
);

router.get('/', authMiddleware, getBorrows);

module.exports = router;
