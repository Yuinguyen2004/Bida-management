const orderService = require('../services/order.service');

exports.getOrdersBySession = async (req, res) => {
  const orders = await orderService.getOrdersBySessionId(req.params.sessionId);
  res.json({ success: true, data: orders });
};

exports.getTotalFnbCost = async (req, res) => {
  const totalFnbCost = await orderService.getTotalFnbCost(req.params.sessionId);
  res.json({ success: true, data: { totalFnbCost } });
};

exports.createOrder = async (req, res) => {
  const { sessionId, fnbItemId, quantity } = req.body;
  const order = await orderService.createOrder({ sessionId, fnbItemId, quantity });
  res.status(201).json({ success: true, data: order });
};
