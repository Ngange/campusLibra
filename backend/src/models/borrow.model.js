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
    dateDue: {
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

// Pre-save hook to set default due date if not provided (service layer can also handle this)
borrowSchema.pre('save', function (next) {
  if (!this.dateDue && this.borrowDate) {
    const due = new Date(this.borrowDate);
    due.setDate(due.getDate() + 14); // Default due date is 14 days from borrow date
    this.dateDue = due;
  }
  next();
});

module.exports = mongoose.model('Borrow', borrowSchema);
