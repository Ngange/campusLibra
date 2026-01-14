const express = require('express');
const {
  createBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookHandler,
  deleteBookHandler,
  getBookCategoriesHandler,
} = require('../controllers/book.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const {
  validateBookCreate,
  validateBookUpdate,
  validateMongoId,
  validatePagination,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Permission-based access (more granular)
router.post(
  '/',
  authorizePermission('book_create'),
  validateBookCreate,
  handleValidationErrors,
  createBookHandler
);
router.put(
  '/:id',
  authorizePermission('book_update'),
  validateMongoId,
  validateBookUpdate,
  handleValidationErrors,
  updateBookHandler
);
router.delete(
  '/:id',
  authorizePermission('book_delete'),
  validateMongoId,
  handleValidationErrors,
  deleteBookHandler
);

// Read access: any authenticated user (members can browse)
router.get('/', validatePagination, handleValidationErrors, getAllBooksHandler);
router.get('/categories', getBookCategoriesHandler);
router.get('/:id', validateMongoId, handleValidationErrors, getBookByIdHandler);

module.exports = router;
