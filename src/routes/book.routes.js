const express = require('express');
const {
  createBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookHandler,
  deleteBookHandler,
} = require('../controllers/book.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const router = express.Router();

// All book routes require authentication
router.use(authMiddleware);

// Admin/Librarian only
router.post('/', authorizeRoles('admin', 'librarian'), createBookHandler);
router.put('/:id', authorizeRoles('admin', 'librarian'), updateBookHandler);
router.delete('/:id', authorizeRoles('admin', 'librarian'), deleteBookHandler);

// Public read access
router.get('/', getAllBooksHandler);
router.get('/:id', getBookByIdHandler);

module.exports = router;
