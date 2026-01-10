const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const borrowSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrow must belong to a user'],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Borrow must specify a book'],
    },
    bookCopy: {
      type: Schema.Types.ObjectId,
      ref: 'BookCopy',
      required: [true, 'Borrow must specify a book copy'],
    },
    borrowDate: {
      type: Date,
      required: [true, 'Borrow date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes for performance
borrowSchema.index({ user: 1, status: 1 }); // User's active/returned borrows
borrowSchema.index({ book: 1, status: 1 }); // Book availability queries
borrowSchema.index({ bookCopy: 1 }); // Track specific copy
borrowSchema.index({ dueDate: 1, status: 1 }); // Overdue reports
borrowSchema.index({ borrowDate: 1 }); // Date range queries

module.exports = mongoose.model('Borrow', borrowSchema);
