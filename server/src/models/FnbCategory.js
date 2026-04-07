const mongoose = require('mongoose');
const fnbCategorySchema = require('../entities/fnbCategoryEntity');

module.exports = mongoose.model('FnbCategory', fnbCategorySchema);
