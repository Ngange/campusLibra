const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Audit must reference a book'],
    },
    bookCopy: {
      type: Schema.Types.ObjectId,
      ref: 'BookCopy',
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'], //values will be enforced vi service using setting
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Audit must reference a user'],
    },
    details: {
      type: Schema.Types.Mixed, // Flexible field to store additional info about the action
    },
    timestamp: {
      type: Date,
      default: Date.now, // Always set timestamp on creation
    },
  },
  { timestamps: true }
); // Also add createdAt/updatedAt

module.exports = mongoose.model('BookAudit', SettingSchema);
