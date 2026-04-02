const OrderItemRepository = require('../repositories/OrderItemRepository');
const FnbItemRepository = require('../repositories/FnbItemRepository');
const ApiError = require('../utils/apiError');

const orderItemRepository = new OrderItemRepository();
const fnbItemRepository = new FnbItemRepository();

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

  return orderItemRepository.create({
    sessionId,
    fnbItemId,
    quantity,
    price: fnbItem.price * quantity,
  });
};

module.exports = { getOrdersBySessionId, createOrder };
