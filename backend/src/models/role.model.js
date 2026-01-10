const mongoose = require('mongoose');

// Define the Role schema
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['admin', 'librarian', 'member'], // enforce these roles for now
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
