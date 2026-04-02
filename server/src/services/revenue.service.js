const SessionRepository = require('../repositories/SessionRepository');
const OrderItemRepository = require('../repositories/OrderItemRepository');
const ApiError = require('../utils/apiError');

const sessionRepository = new SessionRepository();
const orderItemRepository = new OrderItemRepository();

const getDailyRevenue = async (date) => {
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const result = await sessionRepository.aggregate([
    {
      $match: {
        status: 'completed',
        endTime: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalTableCost: { $sum: '$totalTableCost' },
        totalFnbCost: { $sum: '$totalFnbCost' },
        sessionCount: { $sum: 1 },
      },
    },
  ]);

  return {
    date: startOfDay.toISOString().split('T')[0],
    totalRevenue: result[0]?.totalRevenue || 0,
    totalTableCost: result[0]?.totalTableCost || 0,
    totalFnbCost: result[0]?.totalFnbCost || 0,
    sessionCount: result[0]?.sessionCount || 0,
  };
};

const getMonthlyRevenue = async (month, year) => {
  const now = new Date();
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
  const targetYear = year ? parseInt(year) : now.getFullYear();

  const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
  const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const result = await sessionRepository.aggregate([
    {
      $match: {
        status: 'completed',
        endTime: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$endTime' },
        dailyRevenue: { $sum: '$totalAmount' },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalResult = await sessionRepository.aggregate([
    {
      $match: {
        status: 'completed',
        endTime: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalTableCost: { $sum: '$totalTableCost' },
        totalFnbCost: { $sum: '$totalFnbCost' },
        sessionCount: { $sum: 1 },
      },
    },
  ]);

  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const totalRevenue = totalResult[0]?.totalRevenue || 0;

  return {
    month: targetMonth,
    year: targetYear,
    totalRevenue,
    totalTableCost: totalResult[0]?.totalTableCost || 0,
    totalFnbCost: totalResult[0]?.totalFnbCost || 0,
    sessionCount: totalResult[0]?.sessionCount || 0,
    averagePerDay: daysInMonth > 0 ? Math.round(totalRevenue / daysInMonth) : 0,
    dailyBreakdown: result.map((r) => ({
      day: r._id,
      revenue: r.dailyRevenue,
      sessionCount: r.sessionCount,
    })),
  };
};

const getSummary = async () => {
  const totalResult = await sessionRepository.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalTableCost: { $sum: '$totalTableCost' },
        totalFnbCost: { $sum: '$totalFnbCost' },
        sessionCount: { $sum: 1 },
      },
    },
  ]);

  const topTables = await sessionRepository.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$tableId',
        usageCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { usageCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'tables',
        localField: '_id',
        foreignField: '_id',
        as: 'table',
      },
    },
    { $unwind: '$table' },
    {
      $project: {
        _id: 0,
        tableId: '$_id',
        name: '$table.name',
        type: '$table.type',
        usageCount: 1,
        totalRevenue: 1,
      },
    },
  ]);

  const topFnb = await sessionRepository.aggregate([
    {
      $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'sessionId',
        as: 'orders',
      },
    },
    { $match: { status: 'completed' } },
    { $unwind: '$orders' },
    {
      $group: {
        _id: '$orders.fnbItemId',
        totalQuantity: { $sum: '$orders.quantity' },
        totalRevenue: { $sum: '$orders.price' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'fnbitems',
        localField: '_id',
        foreignField: '_id',
        as: 'fnbItem',
      },
    },
    { $unwind: '$fnbItem' },
    {
      $project: {
        _id: 0,
        fnbItemId: '$_id',
        name: '$fnbItem.name',
        category: '$fnbItem.category',
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return {
    totalRevenue: totalResult[0]?.totalRevenue || 0,
    totalTableCost: totalResult[0]?.totalTableCost || 0,
    totalFnbCost: totalResult[0]?.totalFnbCost || 0,
    sessionCount: totalResult[0]?.sessionCount || 0,
    topTables,
    topFnb,
  };
};

module.exports = { getDailyRevenue, getMonthlyRevenue, getSummary };
