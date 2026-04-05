const tableService = require('../services/table.service');
const { getIO } = require('../config/socket');

exports.getAllTables = async (req, res) => {
  const tables = await tableService.getAllTables();
  res.json({ success: true, data: tables });
};

exports.getTableById = async (req, res) => {
  const table = await tableService.getTableById(req.params.id);
  res.json({ success: true, data: table });
};

exports.createTable = async (req, res) => {
  const { tableNumber, name, type, pricePerHour, position } = req.body;
  const table = await tableService.createTable({ tableNumber, name, type, pricePerHour, position });
  res.status(201).json({ success: true, data: table });
};

exports.updateTable = async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body);

  if (req.body.status) {
    const io = getIO();
    io.to('tables').emit('table:statusChange', {
      tableId: table._id,
      tableName: table.name,
      status: table.status,
    });
  }

  res.json({ success: true, data: table });
};

exports.deleteTable = async (req, res) => {
  await tableService.deleteTable(req.params.id);
  res.json({ success: true, message: 'Table deleted' });
};
