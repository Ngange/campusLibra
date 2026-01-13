const Reservation = require('../models/reservation.model');
const Book = require('../models/book.model');
const BookCopy = require('../models/bookCopy.model');
const Borrow = require('../models/borrow.model');
const { getSetting } = require('../utils/config.util');
const { createBookAudit } = require('../utils/audit.util');
const { calculateDueDate } = require('../utils/date.util');
const { findAvailableBookCopy } = require('./bookCopy.service');
const {
  emitNotification,
  emitNotificationWithStaff,
} = require('../utils/notification.util');

// Service to create a new reservation
const createReservation = async (userId, bookId) => {
  // 1. Validate book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }

  // 2. Check if user already has an active reservation for this book
  const existing = await Reservation.findOne({
    user: userId,
    book: bookId,
    status: { $in: ['pending', 'on_hold'] },
  });
  if (existing) {
    throw new Error('You already have an active reservation for this book');
  }

  // 3. Check if book is actually available → should borrow instead
  const availableCopies = await BookCopy.countDocuments({
    book: bookId,
    status: 'available',
  });
  if (availableCopies > 0) {
    throw new Error('This book is available — please borrow it directly');
  }

  // 4. Calculate position in queue
  const pendingCount = await Reservation.countDocuments({
    book: bookId,
    status: 'pending',
  });
  const position = pendingCount + 1;

  // 5. Create reservation
  const reservation = await Reservation.create({
    user: userId,
    book: bookId,
    position,
  });

  // Get user name for staff notifications
  const User = require('../models/user.model');
  const user = await User.findById(userId).select('name');
  const userName = user?.name || 'A user';

  // Notify user and staff about new reservation
  await emitNotificationWithStaff(
    userId,
    'Reservation Created',
    `You have reserved "${book.title}" by ${book.author}. Position in queue: ${position}`,
    'New Reservation',
    `${userName} has reserved "${book.title}" by ${book.author}. Position in queue: ${position}`,
    'reservation_created',
    reservation._id,
    'Reservation'
  );

  // 6. Log audit
  await createBookAudit(bookId, null, 'reservation_created', userId, {
    reservationId: reservation._id,
  });

  // 7. Return populated reservation
  const populatedReservation = await Reservation.findById(reservation._id)
    .populate('user', 'name email')
    .populate('book', 'title author');

  return populatedReservation;
};

// service to fulfill the next reservation when a book copy is returned
const fulfillNextReservation = async (bookId) => {
  // Find first pending reservation (lowest position)
  const nextReservation = await Reservation.findOne({
    book: bookId,
    status: 'pending',
  }).sort({ position: 1 });

  if (nextReservation) {
    // Notify this user If none, book stays available
    await notifyReservationAvailable(nextReservation._id);
  }
};

// Service to notify user that their reserved book is available
const notifyReservationAvailable = async (reservationId) => {
  // Fetch reservation with user and book
  const reservation = await Reservation.findById(reservationId)
    .populate('user', 'name email')
    .populate('book', 'title author');

  if (!reservation || reservation.status !== 'pending') {
    throw new Error('Invalid reservation or not in pending state');
  }

  // Get hold duration from settings
  const holdHours = await getSetting('RESERVATION_HOLD_HOURS');
  const now = new Date();
  const holdExpiresAt = new Date(now.getTime() + holdHours * 60 * 60 * 1000);

  // Update reservation to 'on_hold'
  reservation.status = 'on_hold';
  reservation.holdStartAt = now;
  reservation.holdExpiresAt = holdExpiresAt;
  await reservation.save();

  // create notification with socket emit
  await emitNotification(
    reservation.user._id,
    'Book Available for Pickup',
    `Your reserved book "${reservation.book.title}" is now available! Please pick it up within ${holdHours} hours.`,
    'reservation_available',
    reservation._id,
    'Reservation'
  );

  // Log audit
  await createBookAudit(
    reservation.book._id,
    null,
    'reservation_on_hold',
    reservation.user._id,
    { holdHours, reservationId: reservation._id }
  );

  return reservation;
};

// Service to fulfill a reservation when user picks up the book
const fulfillReservationPickup = async (reservationId, librarianId) => {
  const reservation = await Reservation.findById(reservationId)
    .populate('user')
    .populate('book');

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  if (reservation.status !== 'on_hold') {
    throw new Error('Reservation is not on hold');
  }

  if (new Date() > reservation.holdExpiresAt) {
    throw new Error('Hold period has expired');
  }

  // Find an available copy
  const bookCopy = await findAvailableBookCopy(reservation.book._id);

  // Calculate due date
  const borrowDate = new Date();
  const dueDate = await calculateDueDate(borrowDate);

  // Create borrow record
  const borrow = await Borrow.create({
    user: reservation.user._id,
    book: reservation.book._id,
    bookCopy: bookCopy._id,
    borrowDate,
    dueDate,
    status: 'active',
  });

  // Update book copy status
  bookCopy.status = 'borrowed';
  await bookCopy.save();

  // Update reservation
  reservation.bookCopy = bookCopy._id;
  reservation.pickedUpBy = librarianId;
  reservation.pickedUpAt = new Date();
  reservation.status = 'fulfilled';
  await reservation.save();

  // Notify user and staff about pickup
  await emitNotificationWithStaff(
    reservation.user._id,
    'Book Picked Up',
    `You have picked up "${
      reservation.book.title
    }". Please return by ${dueDate.toLocaleDateString()}.`,
    'Book Picked Up',
    `${reservation.user.name} has picked up "${
      reservation.book.title
    }". Due date: ${dueDate.toLocaleDateString()}.`,
    'reservation_fulfilled',
    reservation._id,
    'Reservation'
  );

  // Log audits
  await createBookAudit(
    reservation.book._id,
    bookCopy._id,
    'borrowed',
    reservation.user._id,
    { borrowId: borrow._id }
  );

  await createBookAudit(
    reservation.book._id,
    bookCopy._id,
    'reservation_fulfilled',
    librarianId,
    { reservationId: reservation._id, borrowId: borrow._id }
  );

  return { reservation, borrow };
};

// Service to expire hold reservations that went beyond their hold period
const expireHoldReservations = async () => {
  const now = new Date();
  const expiredReservations = await Reservation.find({
    status: 'on_hold',
    holdExpiresAt: { $lt: now },
  })
    .populate('user')
    .populate('book');

  for (const reservation of expiredReservations) {
    // Mark as expired
    reservation.status = 'expired';
    await reservation.save();

    // Notify user with socket emit
    await emitNotification(
      reservation.user._id,
      'Hold Expired',
      `Your hold for "${reservation.book.title}" has expired. The book has been offered to the next person.`,
      'hold_expired',
      reservation._id,
      'Reservation'
    );

    // Log audit
    await createBookAudit(
      reservation.book._id,
      null,
      'reservation_expired',
      reservation.user._id,
      { reason: 'hold_expired', reservationId: reservation._id }
    );

    // Offer book to next user
    await fulfillNextReservation(reservation.book._id);
  }

  return expiredReservations.length;
};

module.exports = {
  createReservation,
  fulfillNextReservation,
  notifyReservationAvailable,
  fulfillReservationPickup,
  expireHoldReservations,
};
