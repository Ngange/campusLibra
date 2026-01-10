const Fine = require('../models/fine.model');
const Borrow = require('../models/borrow.model');
const Book = require('../models/book.model');
const notificationService = require('../services/notification.service');

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
      return res.status(404).json({ message: 'Fine not found' });
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
      return res.status(404).json({ message: 'Fine not found' });
    }

    if (fine.isPaid) {
      return res.status(400).json({ message: 'Fine is already paid' });
    }

    fine.isPaid = true;
    fine.paidAt = new Date();
    await fine.save();

    // Optional: Notify user
    await notificationService.createNotification(
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
