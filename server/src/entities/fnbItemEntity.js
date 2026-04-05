const mongoose = require('mongoose');

const FNB_CATEGORIES = ['food', 'beverage', 'nuoc', 'bia', 'snack'];

const fnbItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: FNB_CATEGORIES,
        message: '{VALUE} is not a valid F&B category',
      },
      lowercase: true,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = fnbItemSchema;
