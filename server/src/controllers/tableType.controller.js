const validateObjectId = require('../utils/validateObjectId');
const tableTypeService = require('../services/tableType.service');

exports.getAllTableTypes = async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const types = await tableTypeService.getAllTableTypes({ includeInactive });
  res.json({ success: true, data: types });
};

exports.getTableTypeById = async (req, res) => {
  validateObjectId(req.params.id);
  const tableType = await tableTypeService.getTableTypeById(req.params.id);
  res.json({ success: true, data: tableType });
};

exports.createTableType = async (req, res) => {
  const tableType = await tableTypeService.createTableType(req.body);
  res.status(201).json({ success: true, data: tableType });
};

exports.updateTableType = async (req, res) => {
  validateObjectId(req.params.id);
  const tableType = await tableTypeService.updateTableType(req.params.id, req.body);
  res.json({ success: true, data: tableType });
};

exports.deleteTableType = async (req, res) => {
  validateObjectId(req.params.id);
  await tableTypeService.deleteTableType(req.params.id);
  res.json({ success: true, message: 'Table type deleted' });
};
