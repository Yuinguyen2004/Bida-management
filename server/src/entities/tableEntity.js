const mongoose = require('mongoose');

const TABLE_TYPES = ['lo', 'carom', 'pool'];

const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: TABLE_TYPES,
        message: '{VALUE} is not a valid table type',
      },
      lowercase: true,
      trim: true,
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'playing', 'maintenance'],
      default: 'available',
    },
    position: {
      x: {
        type: Number,
        min: 0,
      },
      y: {
        type: Number,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = tableSchema;
