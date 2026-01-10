const mongoose = require('mongoose');

// Define the Notification schema to store user notifications
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'reservation_available',
        'hold_expired',
        'borrow_confirmed',
        'book_returned',
        'fine_applied',
        'reservation_fulfilled',
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      // e.g., borrowId, reservationId, bookId
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedModel: {
      // e.g., 'Borrow', 'Reservation', 'Book'
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
