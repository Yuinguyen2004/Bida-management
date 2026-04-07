const mongoose = require('mongoose');
const userSchema = require('../entities/userEntity');

module.exports = mongoose.model('User', userSchema);
