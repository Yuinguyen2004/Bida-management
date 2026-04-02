const TableRepository = require('../repositories/TableRepository');
const ApiError = require('../utils/apiError');

const tableRepository = new TableRepository();

const getAllTables = async () => {
  return tableRepository.findAll();
};

const getTableById = async (id) => {
  const table = await tableRepository.findById(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return table;
};

const createTable = async ({ name, type, pricePerHour, position }) => {
  return tableRepository.create({
    name,
    type,
    pricePerHour,
    position,
    status: 'available',
  });
};

const updateTable = async (id, updateData) => {
  const table = await tableRepository.update(id, updateData);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return table;
};

const deleteTable = async (id) => {
  const table = await tableRepository.delete(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  return table;
};

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };
