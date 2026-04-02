const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');

// Create order (add F&B to active session)
router.post('/', auth, orderController.createOrder);

// Get orders by session ID
router.get('/:sessionId', auth, orderController.getOrdersBySession);

module.exports = router;
