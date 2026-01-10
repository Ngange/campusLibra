const Borrow = require('../models/borrow.model');
const BookCopy = require('../models/bookCopy.model');
const Book = require('../models/book.model');
const Fine = require('../models/fine.model');
const BookAudit = require('../models/bookAudit.model');
const notificationService = require('./notification.service');
const { getSetting } = require('../utils/config.util');
const { fulfillNextReservation } = require('./reservation.service');

const findAvailableBookCopy = async (bookId) => {
  const copy = await BookCopy.findOne({
    book: bookId,
    status: 'available',
  });
  if (!copy) {
    throw new Error('No available copy of this book');
  }
  return copy;
};

const createBookAudit = async (
  bookId,
  bookCopyId,
  action,
  performedBy,
  details = {}
) => {
  await BookAudit.create({
    book: bookId,
    bookCopy: bookCopyId,
    action,
    performedBy,
    details,
  });
};

const borrowBook = async (userId, bookId) => {
  // Validate book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }

  // Find an available physical copy
  const bookCopy = await findAvailableBookCopy(bookId);

  // Get loan period from settings
  const loanDays = await getSetting('LOAN_PERIOD_DAYS');
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + loanDays);

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

  // Send in-app notification
  await notificationService.createNotification(
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
    .populate('user', 'name')
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
  await notificationService.createNotification(
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

  if (borrow.returnDate) {
    throw new Error('Book is already returned');
  }

  // Set return date
  const returnDate = new Date();
  borrow.returnDate = returnDate;
  borrow.status = 'returned';
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
  await notificationService.createNotification(
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

module.exports = {
  borrowBook,
  returnBook,
  calculateFine,
};
