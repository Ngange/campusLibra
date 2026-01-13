const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Function to generate an access JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
  });
};

// Function to generate a refresh token (opaque string)
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Function to verify a JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};
