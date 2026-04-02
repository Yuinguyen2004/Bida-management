const mongoose = require('mongoose');
const sessionSchema = require('../entities/sessionEntity');

module.exports = mongoose.model('Session', sessionSchema);
