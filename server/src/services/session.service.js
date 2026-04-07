const SessionRepository = require('../repositories/SessionRepository');
const TableRepository = require('../repositories/TableRepository');
const OrderItemRepository = require('../repositories/OrderItemRepository');
const CustomerRepository = require('../repositories/CustomerRepository');
const ApiError = require('../utils/apiError');
const { getIO } = require('../config/socket');

const sessionRepository = new SessionRepository();
const tableRepository = new TableRepository();
const orderItemRepository = new OrderItemRepository();
const customerRepository = new CustomerRepository();

const getTierDiscount = (tier) => {
  switch (tier) {
    case 'platinum': return 15;
    case 'gold': return 10;
    case 'silver': return 5;
    default: return 0;
  }
};

const startSession = async (tableId, staffId, customerId) => {
  const table = await tableRepository.findById(tableId);
  if (!table) {
    throw new ApiError(404, 'Ban khong ton tai');
  }
  if (table.status !== 'available') {
    throw new ApiError(400, 'Ban dang duoc su dung hoac bao tri');
  }

  if (customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
  }

  const session = await sessionRepository.create({
    tableId,
    staffId,
    customerId: customerId || null,
    startTime: new Date(),
    status: 'active',
  });

  await tableRepository.update(tableId, { status: 'playing' });

  const fullSession = await sessionRepository.findById(session._id);

  const io = getIO();
  io.to('tables').emit('table:statusChange', {
    tableId,
    tableName: table.name,
    status: 'playing',
  });
  io.to('tables').emit('session:started', {
    sessionId: fullSession._id,
    tableId,
    tableName: table.name,
    staffId: fullSession.staffId?._id,
    staffName: fullSession.staffId?.fullName,
    startedAt: fullSession.startTime,
  });

  return fullSession;
};

const endSession = async (sessionId) => {
  const session = await sessionRepository.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Phien choi khong ton tai');
  }
  if (session.status !== 'active') {
    throw new ApiError(400, 'Phien choi da ket thuc');
  }

  const endTime = new Date();
  const durationMs = endTime - session.startTime;
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));

  const pricePerHour = session.tableId.pricePerHour;
  const totalTableCost = Math.round((durationMinutes / 60) * pricePerHour);

  const orders = await orderItemRepository.findBySessionId(sessionId);
  const totalFnbCost = orders.reduce((sum, order) => sum + order.price, 0);

  const totalAmount = totalTableCost + totalFnbCost;

  let discountPercent = 0;
  let discountAmount = 0;
  let finalAmount = totalAmount;

  if (session.customerId) {
    discountPercent = getTierDiscount(session.customerId.membershipTier);
    discountAmount = Math.round(totalAmount * discountPercent / 100);
    finalAmount = totalAmount - discountAmount;
    await customerRepository.update(session.customerId._id, {
      visitCount: session.customerId.visitCount + 1,
    });
  }

  const updatedSession = await sessionRepository.update(sessionId, {
    endTime,
    duration: durationMinutes,
    totalTableCost,
    totalFnbCost,
    totalAmount: finalAmount,
    discountPercent,
    discountAmount,
    status: 'completed',
  });

  const tableId = session.tableId._id;
  await tableRepository.update(tableId, { status: 'available' });

  const io = getIO();
  io.to('tables').emit('table:statusChange', {
    tableId,
    tableName: session.tableId.name,
    status: 'available',
  });
  io.to('tables').emit('session:ended', {
    sessionId: updatedSession._id,
    tableId,
    tableName: session.tableId.name,
    staffId: session.staffId?._id,
    staffName: session.staffId?.fullName,
    duration: updatedSession.duration,
    totalTableCost: updatedSession.totalTableCost,
    totalFnbCost: updatedSession.totalFnbCost,
    discountPercent: updatedSession.discountPercent,
    discountAmount: updatedSession.discountAmount,
    totalAmount: updatedSession.totalAmount,
    endedAt: updatedSession.endTime,
  });

  return updatedSession;
};

const getSessionById = async (id) => {
  const session = await sessionRepository.findById(id);
  if (!session) {
    throw new ApiError(404, 'Phien choi khong ton tai');
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
    const targetDate = new Date(query.date);
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: start, $lte: end };
  }

  return sessionRepository.findByFilter(filter);
};

module.exports = { startSession, endSession, getSessionById, getSessions };
