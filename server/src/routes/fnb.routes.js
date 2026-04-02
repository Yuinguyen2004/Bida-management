const express = require('express');
const router = express.Router();
const fnbController = require('../controllers/fnb.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all F&B items (menu)
router.get('/', auth, fnbController.getAllFnbItems);

// Get F&B item by ID
router.get('/:id', auth, fnbController.getFnbItemById);

// Create F&B item (admin only)
router.post('/', auth, role('admin'), fnbController.createFnbItem);

// Update F&B item (admin only)
router.put('/:id', auth, role('admin'), fnbController.updateFnbItem);

// Delete F&B item (admin only)
router.delete('/:id', auth, role('admin'), fnbController.deleteFnbItem);

module.exports = router;
