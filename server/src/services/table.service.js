const TableRepository = require('../repositories/TableRepository');
const SessionRepository = require('../repositories/SessionRepository');
const { ensureActiveTableTypeExists, getTableTypeNameMap } = require('./tableType.service');
const ApiError = require('../utils/apiError');

const tableRepository = new TableRepository();
const sessionRepository = new SessionRepository();

const normalizeTableType = (type) => {
  if (typeof type !== 'string') {
    return type;
  }

  return type.trim().toLowerCase();
};

const serializeTable = (table, typeNameMap = {}) => {
  if (!table) {
    return table;
  }

  const serializedTable = typeof table.toObject === 'function' ? table.toObject() : { ...table };
  const normalizedType = normalizeTableType(serializedTable.type);
  return {
    ...serializedTable,
    type: normalizedType,
    typeLabel: typeNameMap[normalizedType] || normalizedType,
  };
};

const getAllTables = async () => {
  const typeNameMap = await getTableTypeNameMap();
  const tables = await tableRepository.findAll();
  return tables.map((table) => serializeTable(table, typeNameMap));
};

const getTableById = async (id) => {
  const typeNameMap = await getTableTypeNameMap();
  const table = await tableRepository.findById(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return serializeTable(table, typeNameMap);
};

const createTable = async ({ tableNumber, name, type, pricePerHour, position }) => {
  if (!tableNumber) {
    throw new ApiError(400, 'tableNumber is required');
  }
  
  const existingTable = await tableRepository.findOne({ tableNumber });
  if (existingTable) {
    throw new ApiError(400, `Table number ${tableNumber} already exists`);
  }

  const normalizedType = normalizeTableType(type);
  await ensureActiveTableTypeExists(normalizedType);

  const table = await tableRepository.create({
    tableNumber,
    name,
    type: normalizedType,
    pricePerHour,
    position,
    status: 'available',
  });
  const typeNameMap = await getTableTypeNameMap();
  return serializeTable(table, typeNameMap);
};

const updateTable = async (id, updateData) => {
  const existingTable = await tableRepository.findById(id);
  if (!existingTable) {
    throw new ApiError(404, 'Table not found');
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'status')) {
    const activeSession = await sessionRepository.findActiveByTableId(id);

    if (!activeSession && updateData.status === 'playing') {
      throw new ApiError(400, 'Khong the chuyen ban sang playing thu cong');
    }

    if (activeSession && updateData.status !== 'playing') {
      throw new ApiError(400, 'Khong the doi trang thai ban khi phien choi chua ket thuc');
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, 'type')) {
    const normalizedType = normalizeTableType(updateData.type);
    await ensureActiveTableTypeExists(normalizedType);
  }

  const normalizedUpdateData = {
    ...updateData,
    type: normalizeTableType(updateData.type),
  };

  if (typeof updateData.type === 'undefined') {
    delete normalizedUpdateData.type;
  }

  const table = await tableRepository.update(id, normalizedUpdateData);
  const typeNameMap = await getTableTypeNameMap();
  return serializeTable(table, typeNameMap);
};

const deleteTable = async (id) => {
  const hasSessionHistory = await sessionRepository.existsByTableId(id);
  if (hasSessionHistory) {
    throw new ApiError(400, 'Khong the xoa ban da co lich su phien choi');
  }

  const table = await tableRepository.delete(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return table;
};

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };
