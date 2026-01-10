const express = require('express');

const {
  borrowBookHandler,
  returnBookHandler,
} = require('../controllers/borrow.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const router = express.Router();

// Member borrows a book
router.post(
  '/',
  authMiddleware,
  authorizeRoles('member'), // Only members can initiate borrows
  borrowBookHandler
);

//  Librarian processes return
router.patch(
  '/:id/return',
  authMiddleware,
  authorizeRoles('librarian', 'admin'), // Only staff can process returns
  returnBookHandler
);

module.exports = router;
