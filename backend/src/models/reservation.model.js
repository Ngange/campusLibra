// src/models/reservation.model.js (updated)
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: true,
    },
    // Will be assigned ONLY when user confirms pickup
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      default: 'pending', // Valid: 'pending', 'on_hold', 'fulfilled', 'cancelled', 'expired'
    },
    position: {
      type: Number,
      required: true,
    },
    holdStartAt: {
      // When the reservation status changes to 'on_hold'
      type: Date,
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    bookCopy: {
      // The specific copy assigned when fulfilled
      type: mongoose.Schema.ObjectId,
      ref: 'BookCopy',
      default: null,
    },
    pickedUpBy: {
      // Who marked it as picked up and when
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
reservationSchema.index({ user: 1, status: 1 }); // User's active reservations
reservationSchema.index({ book: 1, status: 1, position: 1 }); // Queue management
reservationSchema.index({ status: 1, holdExpiresAt: 1 }); // Expiry checks
reservationSchema.index({ bookCopy: 1 }); // Track assigned copies

module.exports = mongoose.model('Reservation', reservationSchema);
