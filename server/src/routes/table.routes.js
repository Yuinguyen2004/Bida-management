const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all tables
router.get('/', auth, tableController.getAllTables);

// Get table by ID
router.get('/:id', auth, tableController.getTableById);

// Create table (admin only)
router.post('/', auth, role('admin'), tableController.createTable);

// Update table (admin only)
router.put('/:id', auth, role('admin'), tableController.updateTable);

// Delete table (admin only)
router.delete('/:id', auth, role('admin'), tableController.deleteTable);

module.exports = router;
