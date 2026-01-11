const express = require('express');

const {
  borrowBookHandler,
  returnBookHandler,
  renewBookHandler,
  getBorrows,
  getMyBorrows,
  getBorrowsByUser,
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

// Get current user's borrows
router.get('/my', authMiddleware, getMyBorrows);

// Member renews a borrowed book
router.patch(
  '/:id/renew',
  authMiddleware,
  authorizeRoles('member'),
  validateMongoId,
  handleValidationErrors,
  renewBookHandler
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

// Get all borrows (admin/librarian)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'librarian'),
  getBorrows
);

// Get borrows by specific user (admin/librarian)
router.get(
  '/user/:userId',
  authMiddleware,
  authorizeRoles('admin', 'librarian'),
  getBorrowsByUser
);

module.exports = router;
