const mongoose = require('mongoose');
const orderItemSchema = require('../entities/orderItemEntity');

module.exports = mongoose.model('OrderItem', orderItemSchema);
