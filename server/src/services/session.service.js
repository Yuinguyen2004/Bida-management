const SessionRepository = require('../repositories/SessionRepository');
const TableRepository = require('../repositories/TableRepository');
const OrderItemRepository = require('../repositories/OrderItemRepository');
const ApiError = require('../utils/apiError');

const sessionRepository = new SessionRepository();
const tableRepository = new TableRepository();
const orderItemRepository = new OrderItemRepository();

const startSession = async ({ tableId, staffId }) => {
  const table = await tableRepository.findById(tableId);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  if (table.status !== 'available') {
    throw new ApiError(400, 'Table is not available');
  }

  const session = await sessionRepository.create({
    tableId,
    staffId,
    startTime: new Date(),
    status: 'active',
  });

  await tableRepository.update(tableId, { status: 'playing' });

  return sessionRepository.findById(session._id);
};

const endSession = async (sessionId) => {
  const session = await sessionRepository.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  if (session.status !== 'active') {
    throw new ApiError(400, 'Session is already completed');
  }

  const endTime = new Date();
  const durationMs = endTime - session.startTime;
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));

  const pricePerHour = session.tableId.pricePerHour;
  const totalTableCost = Math.round((durationMinutes / 60) * pricePerHour);

  const orders = await orderItemRepository.findBySessionId(sessionId);
  const totalFnbCost = orders.reduce((sum, order) => sum + order.price, 0);

  const totalAmount = totalTableCost + totalFnbCost;

  const updatedSession = await sessionRepository.update(sessionId, {
    endTime,
    duration: durationMinutes,
    totalTableCost,
    totalFnbCost,
    totalAmount,
    status: 'completed',
  });

  await tableRepository.update(session.tableId._id, { status: 'available' });

  return updatedSession;
};

const getSessionById = async (id) => {
  const session = await sessionRepository.findById(id);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const orders = await orderItemRepository.findBySessionId(id);

  return { ...session.toObject(), orders };
};

const getSessions = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.date) {
    const date = new Date(query.date);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    filter.startTime = { $gte: start, $lte: end };
  }

  return sessionRepository.findAll(filter);
};

module.exports = { startSession, endSession, getSessionById, getSessions };
