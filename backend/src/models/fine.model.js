const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fineSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    borrow: {
      type: Schema.Types.ObjectId,
      ref: 'Borrow',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Fine amount cannot be negative'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
fineSchema.index({ user: 1, isPaid: 1 }); // User's unpaid fines
fineSchema.index({ borrow: 1 }); // Borrow-related fines
fineSchema.index({ isPaid: 1, createdAt: -1 }); // Fine reports

module.exports = mongoose.model('Fine', fineSchema);
