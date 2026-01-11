const Borrow = require('../models/borrow.model');
const BookCopy = require('../models/bookCopy.model');
const Book = require('../models/book.model');
const Fine = require('../models/fine.model');
const { getSetting } = require('../utils/config.util');
const { createBookAudit } = require('../utils/audit.util');
const { calculateDueDate } = require('../utils/date.util');
const { findAvailableBookCopy } = require('./bookCopy.service');
const { emitNotification } = require('../utils/notification.util');
const { fulfillNextReservation } = require('./reservation.service');

const borrowBook = async (userId, bookId) => {
  // Validate book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }

  // Find an available physical copy
  const bookCopy = await findAvailableBookCopy(bookId);

  // Calculate due date
  const borrowDate = new Date();
  const dueDate = await calculateDueDate(borrowDate);

  // Create borrow record
  const borrow = await Borrow.create({
    user: userId,
    book: bookId,
    bookCopy: bookCopy._id,
    borrowDate,
    dueDate,
    status: 'active',
  });

  // Update book copy status
  bookCopy.status = 'borrowed';
  await bookCopy.save();

  // Send in-app notification with socket emit
  await emitNotification(
    userId,
    'Book Borrowed',
    `You have successfully borrowed "${book.title}" by ${
      book.author
    }. Please return by ${dueDate.toLocaleDateString()}.`,
    'borrow_confirmed',
    borrow._id,
    'Borrow'
  );

  // Log audit
  await createBookAudit(bookId, bookCopy._id, 'borrowed', userId, {
    borrowId: borrow._id,
  });

  // Return populated borrow
  const populatedBorrow = await Borrow.findById(borrow._id)
    .populate('user', 'name email')
    .populate('book', 'title author')
    .populate('bookCopy', 'barcode location');

  return populatedBorrow;
};

const calculateFine = async (borrowId) => {
  const borrow = await Borrow.findById(borrowId).populate('book', 'title');

  if (!borrow || !borrow.returnDate) {
    throw new Error('Borrow record invalid or not returned');
  }

  // Only calculate if overdue
  if (borrow.returnDate <= borrow.dueDate) {
    return null; // No fine
  }

  // Calculate days late
  const timeDiff = borrow.returnDate - borrow.dueDate;
  const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Round up

  if (daysLate <= 0) return null;

  // Get fine rate
  const fineRate = await getSetting('FINE_RATE_PER_DAY');
  const amount = parseFloat((daysLate * fineRate).toFixed(2));

  // Create fine record
  const fine = await Fine.create({
    user: borrow.user,
    borrow: borrowId,
    amount,
  });

  // Notify user
  await emitNotification(
    borrow.user,
    'Fine Applied',
    `A fine of $${amount} has been applied for returning "${borrow.book.title}" ${daysLate} day(s) late.`,
    'fine_applied',
    fine._id,
    'Fine'
  );

  return fine;
};

const returnBook = async (borrowId, librarianId) => {
  // Fetch borrow with related data
  const borrow = await Borrow.findById(borrowId)
    .populate('book', 'title')
    .populate('bookCopy')
    .populate('user', 'name');

  if (!borrow) {
    throw new Error('Borrow record not found');
  }

  // If already returned, return existing data
  if (borrow.returnDate) {
    const existingFine = await Fine.findOne({ borrow: borrowId });
    return { borrow, fine: existingFine };
  }

  // Set return date
  const returnDate = new Date();
  borrow.returnDate = returnDate;

  // Set status based on return date vs due date
  if (returnDate > borrow.dueDate) {
    borrow.status = 'overdue'; // Still mark as overdue to indicate it was late
  } else {
    borrow.status = 'returned';
  }
  await borrow.save();

  // Update book copy status
  const bookCopy = borrow.bookCopy;
  bookCopy.status = 'available';
  await bookCopy.save();

  // Calculate fine (if overdue)
  let fine = null;
  if (returnDate > borrow.dueDate) {
    fine = await calculateFine(borrowId);
  }

  // Notify user
  await emitNotification(
    borrow.user._id,
    'Book Returned',
    `"${borrow.book.title}" has been successfully returned.`,
    'book_returned',
    borrowId,
    'Borrow'
  );

  // Log audit
  await createBookAudit(
    borrow.book._id,
    bookCopy._id,
    'returned',
    librarianId,
    { borrowId, fineId: fine?._id }
  );

  // Check if this book has pending reservations
  await fulfillNextReservation(borrow.book._id);

  return { borrow, fine };
};

const renewBook = async (borrowId, userId) => {
  // Fetch borrow with related data
  const borrow = await Borrow.findById(borrowId)
    .populate('book', 'title')
    .populate('user', 'name');

  if (!borrow) {
    throw new Error('Borrow record not found');
  }

  // Only the user who borrowed can renew
  if (borrow.user._id.toString() !== userId) {
    throw new Error('Unauthorized: Only the borrower can renew this book');
  }

  // Cannot renew if already returned
  if (borrow.returnDate) {
    throw new Error('Cannot renew a returned book');
  }

  // Cannot renew if overdue
  const today = new Date();
  if (today > borrow.dueDate) {
    throw new Error('Cannot renew an overdue book');
  }

  // Check if has unpaid fines
  const hasFines = await Fine.findOne({
    user: userId,
    status: { $ne: 'paid' },
  });

  if (hasFines) {
    throw new Error('Cannot renew while having unpaid fines');
  }

  // Calculate new due date
  const renewDate = new Date();
  const newDueDate = await calculateDueDate(renewDate);

  // Update borrow
  borrow.dueDate = newDueDate;
  await borrow.save();

  // Notify user
  await emitNotification(
    userId,
    'Book Renewed',
    `"${
      borrow.book.title
    }" has been renewed. New due date: ${newDueDate.toLocaleDateString()}.`,
    'book_renewed',
    borrowId,
    'Borrow'
  );

  // Log audit
  await createBookAudit(borrow.book._id, borrow.bookCopy, 'renewed', userId, {
    borrowId,
    newDueDate,
  });

  return borrow;
};

// Update overdue status for active borrows with past due dates
const updateOverdueStatus = async () => {
  const now = new Date();
  await Borrow.updateMany(
    {
      status: 'active',
      dueDate: { $lt: now },
      returnDate: null,
    },
    { $set: { status: 'overdue' } }
  );
};

module.exports = {
  borrowBook,
  returnBook,
  renewBook,
  calculateFine,
  updateOverdueStatus,
};
