const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenue.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/daily', auth, role('admin'), revenueController.getDailyRevenue);
router.get('/monthly', auth, role('admin'), revenueController.getMonthlyRevenue);
router.get('/summary', auth, role('admin'), revenueController.getSummary);

module.exports = router;
