const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt.util');

// Middleware to authenticate requests using JWT
const authMiddleware = (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // get token part after 'Bearer '
  }

  if (!token) {
    const error = new Error('Access denied. No token provided.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);
    req.user = decoded; // Attach decoded user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    const authError = new Error('Invalid or expired token.');
    authError.statusCode = 401;
    return next(authError);
  }
};

module.exports = authMiddleware;
