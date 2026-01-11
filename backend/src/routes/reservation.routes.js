const express = require('express');
const {
  createReservationHandler,
  fulfillPickupHandler,
  getUserReservationsHandler,
  getPendingPickupsHandler,
} = require('../controllers/reservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const {
  validateReservation,
  validateMongoId,
  handleValidationErrors,
} = require('../middlewares/validation.middleware');

const router = express.Router();

// Get current user's reservations
router.get('/', authMiddleware, getUserReservationsHandler);
router.get('/my', authMiddleware, getUserReservationsHandler); // Alias for consistency

// Create new reservation
router.post(
  '/',
  authMiddleware,
  authorizeRoles('member'),
  validateReservation,
  handleValidationErrors,
  createReservationHandler
);

// Get pending pickups (librarian only)
router.get(
  '/pending',
  authMiddleware,
  authorizeRoles('librarian', 'admin'),
  getPendingPickupsHandler
);

// Confirm pickup (librarian only)
router.post(
  '/:id/pickup',
  authMiddleware,
  authorizeRoles('librarian', 'admin'),
  validateMongoId,
  handleValidationErrors,
  fulfillPickupHandler
);

module.exports = router;
