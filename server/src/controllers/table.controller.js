const tableService = require('../services/table.service');
const { getIO } = require('../config/socket');

exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await tableService.getAllTables();
    res.json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

exports.getTableById = async (req, res, next) => {
  try {
    const table = await tableService.getTableById(req.params.id);
    res.json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const { name, type, pricePerHour, position } = req.body;
    const table = await tableService.createTable({ name, type, pricePerHour, position });
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);

    if (req.body.status) {
      const io = getIO();
      io.to('tables').emit('table:statusChange', {
        tableId: table._id,
        status: table.status,
      });
    }

    res.json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    await tableService.deleteTable(req.params.id);
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};
