const mongoose = require('mongoose');
const tableSchema = require('../entities/tableEntity');

module.exports = mongoose.model('Table', tableSchema);
