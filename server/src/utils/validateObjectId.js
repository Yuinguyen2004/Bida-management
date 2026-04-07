const mongoose = require('mongoose');
const ApiError = require('./apiError');

const validateObjectId = (id, fieldName = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${fieldName} khong hop le`);
  }
};

module.exports = validateObjectId;
