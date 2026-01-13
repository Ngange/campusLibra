const express = require('express');
const {
  register,
  login,
  updateProfileHandler,
  changePasswordHandler,
} = require('../controllers/auth.controller');
const {
  refreshAccessToken,
  revokeRefreshToken,
} = require('../controllers/refreshToken.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// Routes for user registration and login
router.post(
  '/register',
  validateUserRegistration,
  handleValidationErrors,
  register
);
router.post('/login', validateUserLogin, handleValidationErrors, login);

// Refresh token routes (public)
router.post('/refresh', refreshAccessToken);
router.post('/revoke', revokeRefreshToken);

// Authenticated self-service routes
router.use(authMiddleware);
router.put(
  '/profile',
  validateProfileUpdate,
  handleValidationErrors,
  updateProfileHandler
);
router.post(
  '/change-password',
  validatePasswordChange,
  handleValidationErrors,
  changePasswordHandler
);

module.exports = router;
