const Reservation = require('../models/reservation.model');
const {
  createReservation,
  fulfillReservationPickup,
} = require('../services/reservation.service');

const createReservationHandler = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const reservation = await createReservation(userId, bookId);

    // Emit dashboard update to all roles
    if (global.emitDashboardUpdate) {
      global.emitDashboardUpdate(['admin', 'librarian', 'member']);
    }

    res.status(201).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

const fulfillPickupHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id; // Librarian confirming pickup

    const result = await fulfillReservationPickup(id, librarianId);

    // Emit dashboard update to all roles
    if (global.emitDashboardUpdate) {
      global.emitDashboardUpdate(['admin', 'librarian', 'member']);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getUserReservationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ user: userId })
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

const getPendingPickupsHandler = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ status: 'on_hold' })
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ holdUntil: 1 }); // Soonest expiring first

    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservationHandler,
  fulfillPickupHandler,
  getUserReservationsHandler,
  getPendingPickupsHandler,
};
