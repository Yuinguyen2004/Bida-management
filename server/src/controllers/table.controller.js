const tableService = require('../services/table.service');
const { getIO } = require('../config/socket');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');

const TABLE_TYPES = ['lo', 'carom', 'pool', 'snooker', 'ping-pong'];
const TABLE_STATUSES = ['available', 'playing', 'maintenance'];
const TABLE_UPDATE_FIELDS = ['tableNumber', 'name', 'type', 'pricePerHour', 'status', 'position'];

const ensureObject = (payload, message) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, message);
  }
};

const parseNonNegativeNumber = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ApiError(400, `${fieldName} phai la so >= 0`);
  }

  return value;
};

const parsePositiveInteger = (value, fieldName) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ApiError(400, `${fieldName} phai la so nguyen duong`);
  }
  return value;
};

const parseNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${fieldName} la bat buoc`);
  }
  return value.trim();
};

const parseTableType = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'type la bat buoc');
  }

  const normalizedType = value.trim().toLowerCase();
  if (!TABLE_TYPES.includes(normalizedType)) {
    throw new ApiError(400, 'type khong hop le');
  }

  return normalizedType;
};

const parseTableStatus = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'status khong hop le');
  }

  const normalizedStatus = value.trim().toLowerCase();
  if (!TABLE_STATUSES.includes(normalizedStatus)) {
    throw new ApiError(400, 'status khong hop le');
  }

  return normalizedStatus;
};

const parsePosition = (value) => {
  if (value === undefined) {
    return undefined;
  }

  ensureObject(value, 'position khong hop le');

  const position = {};
  const keys = ['row', 'col', 'x', 'y'];

  for (const key of keys) {
    if (typeof value[key] !== 'undefined') {
      position[key] = parseNonNegativeNumber(value[key], `position.${key}`);
    }
  }

  return position;
};

const validateObjectId = (id, fieldName = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${fieldName} khong hop le`);
  }
};

const buildCreateTablePayload = (body) => {
  ensureObject(body, 'Du lieu tao ban khong hop le');

  return {
    tableNumber: parsePositiveInteger(body.tableNumber, 'tableNumber'),
    name: parseNonEmptyString(body.name, 'name'),
    type: parseTableType(body.type),
    pricePerHour: parseNonNegativeNumber(body.pricePerHour, 'pricePerHour'),
    position: parsePosition(body.position),
  };
};

const buildUpdateTablePayload = (body) => {
  ensureObject(body, 'Du lieu cap nhat ban khong hop le');

  const updateKeys = Object.keys(body).filter((key) => TABLE_UPDATE_FIELDS.includes(key));
  if (!updateKeys.length) {
    throw new ApiError(400, 'Khong co truong hop le de cap nhat');
  }

  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, 'tableNumber')) {
    payload.tableNumber = parsePositiveInteger(body.tableNumber, 'tableNumber');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    payload.name = parseNonEmptyString(body.name, 'name');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'type')) {
    payload.type = parseTableType(body.type);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'pricePerHour')) {
    payload.pricePerHour = parseNonNegativeNumber(body.pricePerHour, 'pricePerHour');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    payload.status = parseTableStatus(body.status);
  }
  if (Object.prototype.hasOwnProperty.call(body, 'position')) {
    payload.position = parsePosition(body.position);
  }

  return payload;
};

exports.getAllTables = async (req, res) => {
  const tables = await tableService.getAllTables();
  res.json({ success: true, data: tables });
};

exports.getTableById = async (req, res) => {
  validateObjectId(req.params.id);
  const table = await tableService.getTableById(req.params.id);
  res.json({ success: true, data: table });
};

exports.createTable = async (req, res) => {
  const payload = buildCreateTablePayload(req.body);
  const table = await tableService.createTable(payload);
  res.status(201).json({ success: true, data: table });
};

exports.updateTable = async (req, res) => {
  validateObjectId(req.params.id);

  const payload = buildUpdateTablePayload(req.body);
  const table = await tableService.updateTable(req.params.id, payload);

  if (payload.status) {
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
  validateObjectId(req.params.id);
  await tableService.deleteTable(req.params.id);
  res.json({ success: true, message: 'Table deleted' });
};
