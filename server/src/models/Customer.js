const mongoose = require('mongoose');
const customerSchema = require('../entities/customerEntity');

module.exports = mongoose.model('Customer', customerSchema);
