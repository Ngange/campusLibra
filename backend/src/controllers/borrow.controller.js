const Borrow = require('../models/borrow.model');
const {
  borrowBook,
  returnBook,
  renewBook,
} = require('../services/borrow.service');

const borrowBookHandler = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    const borrow = await borrowBook(userId, bookId);

    // Emit dashboard update to all roles
    if (global.emitDashboardUpdate) {
      global.emitDashboardUpdate(['admin', 'librarian', 'member']);
    }

    res.status(201).json({ success: true, borrow });
  } catch (error) {
    next(error);
  }
};

const returnBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id; // Librarian or admin processes return

    const result = await returnBook(id, librarianId);

    // Emit dashboard update to all roles
    if (global.emitDashboardUpdate) {
      global.emitDashboardUpdate(['admin', 'librarian', 'member']);
    }

    res.json({ success: true, borrow: result.borrow, fine: result.fine });
  } catch (error) {
    next(error);
  }
};

const renewBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const borrow = await renewBook(id, userId);

    // Emit dashboard update to member and admin roles
    if (global.emitDashboardUpdate) {
      global.emitDashboardUpdate(['admin', 'member']);
    }

    res.json({ success: true, borrow });
  } catch (error) {
    next(error);
  }
};

const getMyBorrows = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const borrows = await Borrow.find({ user: userId })
      .populate('user', 'name email')
      .populate('book', 'title author')
      .populate('bookCopy', 'status')
      .sort({ borrowDate: -1 });
    res.json({ success: true, borrows });
  } catch (error) {
    next(error);
  }
};

const getBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.find({
      status: { $in: ['active', 'overdue'] },
      returnDate: null,
    })
      .populate('user', 'name email')
      .populate('book', 'title author')
      .populate('bookCopy', 'status')
      .sort({ borrowDate: -1 });

    res.json({ success: true, borrows });
  } catch (error) {
    next(error);
  }
};

const getBorrowsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const borrows = await Borrow.find({ user: userId })
      .populate('book', 'title author')
      .populate('bookCopy', 'status')
      .sort({ borrowDate: -1 });

    res.json({ success: true, borrows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBookHandler,
  returnBookHandler,
  renewBookHandler,
  getMyBorrows,
  getBorrows,
  getBorrowsByUser,
};
