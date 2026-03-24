const Table = require('../models/Table');
const ApiError = require('../utils/apiError');
const { getIO } = require('../config/socket');

exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.find();
    res.json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

exports.getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      throw new ApiError(404, 'Table not found');
    }
    res.json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

// Create table (admin only)
exports.createTable = async (req, res, next) => {
  try {
    const { name, type, pricePerHour, position } = req.body;
    const table = await Table.create({
      name,
      type,
      pricePerHour,
      position,
      status: 'available',
    });
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

// Update table (admin only)
exports.updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!table) {
      throw new ApiError(404, 'Table not found');
    }

    // Emit socket event if status changed
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

// Delete table (admin only)
exports.deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      throw new ApiError(404, 'Table not found');
    }
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};
