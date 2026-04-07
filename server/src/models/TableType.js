const mongoose = require('mongoose');
const tableTypeSchema = require('../entities/tableTypeEntity');

module.exports = mongoose.model('TableType', tableTypeSchema);
