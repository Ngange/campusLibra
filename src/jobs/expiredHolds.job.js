// src/jobs/expiredHolds.job.js
const cron = require('node-cron');
const Reservation = require('../models/reservation.model');
const notificationService = require('../services/notification.service');
const { fulfillNextReservation } = require('../services/reservation.service');

/**
 * Automatically expire hold reservations that have passed their deadline
 * and offer the book to the next person in the queue.
 */
const expireHoldReservations = async () => {
  const now = new Date();

  // Find all on_hold reservations where hold period has expired
  const expiredReservations = await Reservation.find({
    status: 'on_hold',
    holdExpiresAt: { $lt: now },
  })
    .populate('user', 'name') // Needed for notification message
    .populate('book', 'title'); // Needed for notification message

  console.log(
    `Found ${expiredReservations.length} expired hold(s) to process.`
  );

  for (const reservation of expiredReservations) {
    try {
      // 1. Update reservation status to 'expired'
      reservation.status = 'expired';
      await reservation.save();

      // 2. Create in-app notification for the user
      await notificationService.createNotification(
        reservation.user._id,
        'Hold Expired',
        `Your hold for "${reservation.book.title}" has expired. The book has been offered to the next person in the reservation queue.`,
        'hold_expired',
        reservation._id,
        'Reservation'
      );

      // 3. Offer the book to the next user in line
      await fulfillNextReservation(reservation.book._id);

      console.log(
        `Expired reservation ${reservation._id} for user ${reservation.user.name}`
      );
    } catch (error) {
      console.error(
        `Failed to process expired reservation ${reservation._id}:`,
        error.message
      );
    }
  }

  return expiredReservations.length;
};

// Schedule the job to run every hour
cron.schedule('0 * * * *', expireHoldReservations);

// Export for testing or manual triggering
module.exports = { expireHoldReservations };
