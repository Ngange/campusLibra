const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require('../services/book.service');

// POST /api/books
const createBookHandler = async (req, res, next) => {
  try {
    const { copyCount = 1, ...bookData } = req.body;
    const performedBy = req.user.id;

    const result = await createBook(bookData, copyCount, performedBy);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/books
const getAllBooksHandler = async (req, res, next) => {
  try {
    const filters = {
      title: req.query.title,
      author: req.query.author,
      category: req.query.category,
      availability: req.query.availability,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await getAllBooks(filters);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id
const getBookByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);
    res.json({ success: true, book });
  } catch (error) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// PUT /api/books/:id
const updateBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const performedBy = req.user.id;

    const book = await updateBook(id, req.body, performedBy);
    res.json({ success: true, book });
  } catch (error) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// DELETE /api/books/:id
const deleteBookHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const performedBy = req.user.id;

    await deleteBook(id, performedBy);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookHandler,
  deleteBookHandler,
};
