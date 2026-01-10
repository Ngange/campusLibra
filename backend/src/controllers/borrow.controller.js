const Borrow = require('../models/borrow.model');
const { borrowBook, returnBook } = require('../services/borrow.service');

const borrowBookHandler = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const borrow = await borrowBook(userId, bookId);
    res.status(201).json({ success: true, data: borrow });
  } catch (error) {
    next(error);
  }
};

const returnBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id; // Librarian or admin processes return

    const result = await returnBook(id, librarianId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id })
      .populate('book', 'title author')
      .populate('bookCopy', 'status');
    res.json({ success: true, borrows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBookHandler,
  returnBookHandler,
  getBorrows,
};
