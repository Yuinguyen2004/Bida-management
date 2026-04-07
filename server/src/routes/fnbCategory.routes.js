const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const fnbCategoryController = require('../controllers/fnbCategory.controller');

router.get('/', auth, fnbCategoryController.getAllFnbCategories);
router.get('/:id', auth, fnbCategoryController.getFnbCategoryById);
router.post('/', auth, role('admin'), fnbCategoryController.createFnbCategory);
router.put('/:id', auth, role('admin'), fnbCategoryController.updateFnbCategory);
router.delete('/:id', auth, role('admin'), fnbCategoryController.deleteFnbCategory);

module.exports = router;
