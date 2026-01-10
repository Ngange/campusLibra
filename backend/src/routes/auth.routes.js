const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const {
  validateUserRegistration,
  validateUserLogin,
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

module.exports = router;
