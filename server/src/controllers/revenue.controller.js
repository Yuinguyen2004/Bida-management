const revenueService = require('../services/revenue.service');

exports.getDailyRevenue = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await revenueService.getDailyRevenue(date);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyRevenue = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const data = await revenueService.getMonthlyRevenue(month, year);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const data = await revenueService.getSummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
