const orderService = require('../services/order.service');

exports.getOrdersBySession = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersBySessionId(req.params.sessionId);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { sessionId, fnbItemId, quantity } = req.body;
    const order = await orderService.createOrder({ sessionId, fnbItemId, quantity });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
