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
    if (error.message === 'No available copy of this book') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error); // Pass to global error handler
  }
};

const returnBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id; // Librarian or admin processes return

    const result = await returnBook(id, librarianId);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Borrow record not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Book is already returned') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  borrowBookHandler,
  returnBookHandler,
};
