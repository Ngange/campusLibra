const Book = require('../models/book.model');
const BookCopy = require('../models/bookCopy.model');
const { createBookAudit } = require('../utils/audit.util');

const createBook = async (bookData, copyCount = 1, performedBy) => {
  // Create the book
  const book = await Book.create(bookData);

  // Create physical copies
  const copies = [];
  for (let i = 0; i < copyCount; i++) {
    const copy = await BookCopy.create({
      book: book._id,
      status: 'available',
    });
    copies.push(copy);
  }

  // Log audit
  await createBookAudit(book._id, null, 'book_created', performedBy, {
    copyCount,
  });

  return { book, copies };
};

const getAllBooks = async (filters = {}) => {
  const {
    title,
    author,
    category,
    availability, // 'available' or 'all'
    page = 1,
    limit = 10,
  } = filters;

  let query = {};

  // Text search
  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }
  if (author) {
    query.author = { $regex: author, $options: 'i' };
  }
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  // Build aggregation pipeline
  let pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'bookcopies',
        localField: '_id',
        foreignField: 'book',
        as: 'copies',
      },
    },
    {
      $addFields: {
        totalCopies: { $size: '$copies' },
        availableCopies: {
          $size: {
            $filter: {
              input: '$copies',
              cond: { $eq: ['$$this.status', 'available'] },
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  // Only show books with available copies?
  if (availability === 'available') {
    pipeline.push({ $match: { availableCopies: { $gt: 0 } } });
  }

  // Pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

  const books = await Book.aggregate(pipeline);
  const total = await Book.countDocuments(query);

  return { books, total, page, totalPages: Math.ceil(total / limit) };
};

const getBookById = async (id) => {
  const book = await Book.findById(id);
  if (!book) throw new Error('Book not found');

  // Get all copies for this book
  const copies = await BookCopy.find({ book: id });

  // Calculate counts
  const totalCopies = copies.length;
  const availableCopies = copies.filter(
    (copy) => copy.status === 'available'
  ).length;

  // Convert book to plain object and add copy counts
  const bookObject = book.toObject();
  bookObject.totalCopies = totalCopies;
  bookObject.availableCopies = availableCopies;

  return bookObject;
};

const updateBook = async (id, updateData, performedBy) => {
  const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
  if (!book) throw new Error('Book not found');

  await createBookAudit(id, null, 'book_updated', performedBy, {
    updatedFields: Object.keys(updateData),
  });

  return book;
};

const deleteBook = async (id, performedBy) => {
  // Delete all copies first
  await BookCopy.deleteMany({ book: id });

  const book = await Book.findByIdAndDelete(id);
  if (!book) throw new Error('Book not found');

  await createBookAudit(id, null, 'book_deleted', performedBy, {});

  return book;
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
