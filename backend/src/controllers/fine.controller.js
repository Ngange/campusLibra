const Fine = require('../models/fine.model');
const Borrow = require('../models/borrow.model');
const Book = require('../models/book.model');
const { emitNotification } = require('../utils/notification.util');

const getUserFinesHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const fines = await Fine.find({ user: userId })
      .populate('borrow', 'book')
      .sort({ createdAt: -1 });

    // Populate book title for UI
    for (const fine of fines) {
      if (fine.borrow && fine.borrow.book) {
        const book = await Book.findById(fine.borrow.book).select('title');
        fine.borrow.book = book;
      }
    }

    res.json({ success: true, fines });
  } catch (error) {
    next(error);
  }
};

const getFineByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const fine = await Fine.findOne({ _id: id, user: userId })
      .populate('borrow')
      .populate('user', 'name');

    if (!fine) {
      const error = new Error('Fine not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, fine });
  } catch (error) {
    next(error);
  }
};

const payFineHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const librarianId = req.user.id;

    const fine = await Fine.findById(id);
    if (!fine) {
      const error = new Error('Fine not found');
      error.statusCode = 404;
      return next(error);
    }

    if (fine.isPaid) {
      const error = new Error('Fine is already paid');
      error.statusCode = 400;
      return next(error);
    }

    fine.isPaid = true;
    fine.paidAt = new Date();
    await fine.save();

    // Optional: Notify user with socket emit
    await emitNotification(
      fine.user,
      'Fine Paid',
      'Your fine has been marked as paid by library staff.',
      'fine_paid',
      fine._id,
      'Fine'
    );

    res.json({ success: true, fine });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserFinesHandler,
  getFineByIdHandler,
  payFineHandler,
};
