const { body, param, query, validationResult } = require('express-validator');

// Borrow validation
const validateBorrow = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID format'),
];

// Reservation validation
const validateReservation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID format'),
];

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/)
    .withMessage('Password must contain at least one letter and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'librarian', 'member'])
    .withMessage('Invalid role'),
];

// User login validation
const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// User update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('role').optional().isString().withMessage('Role must be a string'),
];

// Profile update validation (self-service)
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

// Password change validation (self-service)
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[A-Z])/)
    .withMessage('Password must include an uppercase letter')
    .matches(/(?=.*[a-z])/)
    .withMessage('Password must include a lowercase letter')
    .matches(/(?=.*\d)/)
    .withMessage('Password must include a number')
    .matches(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
    .withMessage('Password must include a special character'),
];

// Book creation validation
const validateBookCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{10}|\d{13})$/)
    .withMessage('ISBN must be 10 or 13 digits'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Invalid published year'),
  body('copyCount')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Copy count must be between 1 and 100'),
];

// Book update validation
const validateBookUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?:\d{10}|\d{13})$/)
    .withMessage('ISBN must be 10 or 13 digits'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Invalid published year'),
];

// Role validation
const validateRole = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-z_]+$/)
    .withMessage('Role name must be lowercase with underscores only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
];

// Role update validation
const validateRoleUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-z_]+$/)
    .withMessage('Role name must be lowercase with underscores only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
];

// Generic MongoDB ID validation
const validateMongoId = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.validationErrors = errors.array();
    return next(error);
  }
  next();
};

// Permission validation
const validatePermission = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Permission name is required')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Permission name must contain only letters, numbers, and underscores')
    .isLength({ min: 3, max: 50 })
    .withMessage('Permission name must be between 3 and 50 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system'])
    .withMessage('Category must be one of: book, user, borrow, reservation, fine, role, system'),
  handleValidationErrors,
];

const validatePermissionUpdate = [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system'])
    .withMessage('Category must be one of: book, user, borrow, reservation, fine, role, system'),
  handleValidationErrors,
];

module.exports = {
  validateBorrow,
  validateReservation,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateProfileUpdate,
  validatePasswordChange,
  validateBookCreate,
  validateBookUpdate,
  validateRole,
  validateRoleUpdate,
  validateMongoId,
  validatePagination,
  validatePermission,
  validatePermissionUpdate,
  handleValidationErrors,
};
