const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting Key is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed, // Can store any type of data
      required: [true, 'Setting Value is required'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, //  update createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Setting', SettingSchema);
