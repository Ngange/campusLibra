const mongoose = require('mongoose');
const schema = mongoose.Schema;

// Define the User schema
const bookSchema = new schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    publishedDate: {
      type: Date,
    },
    category: {
      type: String,
      trim: true,
    },
    totalCopies: {
      type: Number,
      default: 1,
      min: [0, 'Total copies cannot be negative'],
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: [0, 'Available copies cannot be negative'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
