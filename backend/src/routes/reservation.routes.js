const express = require('express');
const {
  createReservationHandler,
  fulfillPickupHandler,
  getUserReservationsHandler,
} = require('../controllers/reservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const router = express.Router();

// Get current user's reservations
router.get('/', authMiddleware, getUserReservationsHandler);

// Create new reservation
router.post(
  '/',
  authMiddleware,
  authorizeRoles('member'),
  createReservationHandler
);

// Confirm pickup (librarian only)
router.post(
  '/:id/pickup',
  authMiddleware,
  authorizeRoles('librarian', 'admin'),
  fulfillPickupHandler
);

module.exports = router;
