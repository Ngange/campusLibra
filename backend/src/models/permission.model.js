const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true,
      // (e.g., 'book_delete', 'user_manage')
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['book', 'user', 'borrow', 'reservation', 'fine', 'role', 'system'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', permissionSchema);
