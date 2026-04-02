const revenueService = require('../services/revenue.service');

exports.getDailyRevenue = async (req, res) => {
  const { date } = req.query;
  const data = await revenueService.getDailyRevenue(date);
  res.json({ success: true, data });
};

exports.getMonthlyRevenue = async (req, res) => {
  const { month, year } = req.query;
  const data = await revenueService.getMonthlyRevenue(month, year);
  res.json({ success: true, data });
};

exports.getSummary = async (req, res) => {
  const data = await revenueService.getSummary();
  res.json({ success: true, data });
};
