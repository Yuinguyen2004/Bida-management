const mongoose = require('mongoose');
const fnbItemSchema = require('../entities/fnbItemEntity');

module.exports = mongoose.model('FnbItem', fnbItemSchema);
