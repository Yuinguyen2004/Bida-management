const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    fnbItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FnbItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = orderItemSchema;
