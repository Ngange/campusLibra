const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with request ID
  logger.error('Error occurred:', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Handle express-validator validation errors
  if (err.validationErrors) {
    statusCode = 400;
    message = err.validationErrors.map((e) => e.msg).join(', ');
  }

  // Handle all known error messages with proper status codes
  const errorMap = {
    // 400 Bad Request
    'No available copy of this book': 400,
    'You already have an active reservation for this book': 400,
    'This book is available — please borrow it directly': 400,
    'Reservation is not on hold': 400,
    'Hold period has expired': 400,
    'Borrow record invalid or not returned': 400,
    'Invalid reservation or not in pending state': 400,
    'Invalid role': 400,
    'Book is already returned': 400,
    'Fine is already paid': 400,
    'Cannot create system roles via API. Use settings to modify.': 400,
    'Cannot delete system roles': 400,

    // 401 Unauthorized
    'Access denied. No token provided.': 401,
    'Invalid or expired token.': 401,
    'Invalid token payload.': 401,
    'Invalid email or password': 401,

    // 403 Forbidden
    'Access denied. Insufficient permissions.': 403,
    'Access denied': 403,

    // 404 Not Found
    'Book not found': 404,
    'User not found': 404,
    'Role not found': 404,
    'Reservation not found': 404,
    'Borrow record not found': 404,
    'Fine not found': 404,

    // 409 Conflict
    'User already exists with this email': 409,
    'Email already in use': 409,
    'Role name already exists': 409,
    'A book with this ISBN already exists': 409,
  };

  // Check if error message matches known errors
  if (errorMap[message]) {
    statusCode = errorMap[message];
  }

  // Handle Mongoose-specific errors
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
