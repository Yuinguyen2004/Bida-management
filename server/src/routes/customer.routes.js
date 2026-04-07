const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all customers
router.get('/', auth, customerController.getAllCustomers);

// Get customer by phone (must be before /:id)
router.get('/phone/:phone', auth, customerController.getCustomerByPhone);

// Get customer by ID
router.get('/:id', auth, customerController.getCustomerById);

// Create customer (admin only)
router.post('/', auth, role('admin'), customerController.createCustomer);

// Update customer (admin only)
router.put('/:id', auth, role('admin'), customerController.updateCustomer);

// Delete customer (admin only)
router.delete('/:id', auth, role('admin'), customerController.deleteCustomer);

// Record a visit
router.post('/:id/visit', auth, customerController.recordVisit);

// Add points
router.post('/:id/points', auth, customerController.addPoints);

module.exports = router;
