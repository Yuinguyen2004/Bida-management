const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const tableTypeController = require('../controllers/tableType.controller');

router.get('/', auth, tableTypeController.getAllTableTypes);
router.get('/:id', auth, tableTypeController.getTableTypeById);
router.post('/', auth, role('admin'), tableTypeController.createTableType);
router.put('/:id', auth, role('admin'), tableTypeController.updateTableType);
router.delete('/:id', auth, role('admin'), tableTypeController.deleteTableType);

module.exports = router;
