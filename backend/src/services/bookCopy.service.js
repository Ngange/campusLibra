const BookCopy = require('../models/bookCopy.model');

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

module.exports = { findAvailableBookCopy };
