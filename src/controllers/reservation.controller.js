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
    res.status(201).json({ success: true, reservation });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes('already have') ||
      error.message.includes('available')
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const fulfillPickupHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id; // Librarian confirming pickup

    const result = await fulfillReservationPickup(id, librarianId);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message.includes('not on hold') ||
      error.message.includes('expired')
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'No available copy found') {
      return res
        .status(500)
        .json({ message: 'System error: no copy available' });
    }
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

module.exports = {
  createReservationHandler,
  fulfillPickupHandler,
  getUserReservationsHandler,
};
