const mongoose = require('mongoose');
const schema = mongoose.Schema;

// Define the Book schema
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
  },
  { timestamps: true }
);

// Virtual field to populate book copies associated with the book
bookSchema.virtual('copies', {
  ref: 'BookCopy',
  localField: '_id', // Field in the Book model
  foreignField: 'book', // Field in the BookCopy model
  options: { sort: { createdAt: -1 } },
});

bookSchema.set('toObject', { virtuals: true });
bookSchema.set('toJSON', { virtuals: true });

// Indexes for performance
bookSchema.index({ title: 'text', author: 'text' }); // Text search
bookSchema.index({ category: 1 }); // Filter by category

module.exports = mongoose.model('Book', bookSchema);
