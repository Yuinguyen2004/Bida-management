const TableRepository = require('../repositories/TableRepository');
const ApiError = require('../utils/apiError');

const tableRepository = new TableRepository();
const TABLE_TYPE_ALIASES = {
  snooker: 'lo',
  'ping-pong': 'carom',
};

const normalizeTableType = (type) => {
  if (typeof type !== 'string') {
    return type;
  }

  const normalizedType = type.trim().toLowerCase();
  return TABLE_TYPE_ALIASES[normalizedType] || normalizedType;
};

const serializeTable = (table) => {
  if (!table) {
    return table;
  }

  const serializedTable = typeof table.toObject === 'function' ? table.toObject() : { ...table };
  return {
    ...serializedTable,
    type: normalizeTableType(serializedTable.type),
  };
};

const getAllTables = async () => {
  const tables = await tableRepository.findAll();
  return tables.map(serializeTable);
};

const getTableById = async (id) => {
  const table = await tableRepository.findById(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return serializeTable(table);
};

const createTable = async ({ tableNumber, name, type, pricePerHour, position }) => {
  if (!tableNumber) {
    throw new ApiError(400, 'tableNumber is required');
  }
  
  const existingTable = await tableRepository.findOne({ tableNumber });
  if (existingTable) {
    throw new ApiError(400, `Table number ${tableNumber} already exists`);
  }

  const table = await tableRepository.create({
    tableNumber,
    name,
    type: normalizeTableType(type),
    pricePerHour,
    position,
    status: 'available',
  });
  return serializeTable(table);
};

const updateTable = async (id, updateData) => {
  const normalizedUpdateData = {
    ...updateData,
    type: normalizeTableType(updateData.type),
  };

  if (typeof updateData.type === 'undefined') {
    delete normalizedUpdateData.type;
  }

  const table = await tableRepository.update(id, normalizedUpdateData);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return serializeTable(table);
};

const deleteTable = async (id) => {
  const table = await tableRepository.delete(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return table;
};

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };
