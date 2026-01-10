const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookCopySchema = new Schema(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book copy must belong to a book'],
    },
    Barcode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values if not set
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Book copy must have a status'],
      default: 'available',
    },
    location: {
      type: String,
      trim: true,
      description: 'Location of the book copy within the library',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BookCopy', bookCopySchema);
