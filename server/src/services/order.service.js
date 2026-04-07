const OrderItemRepository = require('../repositories/OrderItemRepository');
const FnbItemRepository = require('../repositories/FnbItemRepository');
const SessionRepository = require('../repositories/SessionRepository');
const ApiError = require('../utils/apiError');
const { getIO } = require('../config/socket');

const orderItemRepository = new OrderItemRepository();
const fnbItemRepository = new FnbItemRepository();
const sessionRepository = new SessionRepository();

const getOrdersBySessionId = async (sessionId) => {
  return orderItemRepository.findBySessionId(sessionId);
};

const createOrder = async ({ sessionId, fnbItemId, quantity }) => {
  const fnbItem = await fnbItemRepository.findById(fnbItemId);
  if (!fnbItem) {
    throw new ApiError(404, 'F&B item not found');
  }
  if (!fnbItem.isAvailable) {
    throw new ApiError(400, 'F&B item is not available');
  }

  const session = await sessionRepository.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  if (session.status !== 'active') {
    throw new ApiError(400, 'Cannot add F&B to a completed session');
  }

  const order = await orderItemRepository.create({
    sessionId,
    fnbItemId,
    quantity,
    price: fnbItem.price * quantity,
  });

  const io = getIO();
  io.to('tables').emit('order:created', {
    orderId: order._id,
    sessionId,
    tableId: session.tableId?._id,
    tableName: session.tableId?.name,
    staffId: session.staffId?._id,
    staffName: session.staffId?.fullName,
    fnbItemId: fnbItem._id,
    itemName: fnbItem.name,
    quantity,
    totalPrice: order.price,
    createdAt: order.createdAt,
  });

  return order;
};

const getTotalFnbCost = async (sessionId) => {
  const orders = await orderItemRepository.findBySessionId(sessionId);
  return orders.reduce((sum, order) => sum + order.price, 0);
};

module.exports = { getOrdersBySessionId, createOrder, getTotalFnbCost };
