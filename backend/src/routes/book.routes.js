const express = require('express');
const {
  createBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookHandler,
  deleteBookHandler,
} = require('../controllers/book.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware'); // 👈 NEW

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Permission-based access (more granular)
router.post('/', authorizePermission('book_create'), createBookHandler);
router.put('/:id', authorizePermission('book_update'), updateBookHandler);
router.delete('/:id', authorizePermission('book_delete'), deleteBookHandler);

// Read access: any authenticated user (members can browse)
router.get('/', getAllBooksHandler);
router.get('/:id', getBookByIdHandler);

module.exports = router;
