const TableTypeRepository = require('../repositories/TableTypeRepository');
const TableRepository = require('../repositories/TableRepository');
const ApiError = require('../utils/apiError');

const tableTypeRepository = new TableTypeRepository();
const tableRepository = new TableRepository();

const DEFAULT_TABLE_TYPES = [
  { code: 'pool', name: 'Pool', sortOrder: 1 },
  { code: 'carom', name: 'Carom', sortOrder: 2 },
  { code: 'lo', name: 'Lo', sortOrder: 3 },
];

const normalizeCode = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

const normalizeOptionalText = (value) => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'Truong van ban khong hop le');
  }

  return value.trim();
};

const parseRequiredName = (value, fieldName) => {
  const normalizedValue = normalizeOptionalText(value);
  if (!normalizedValue) {
    throw new ApiError(400, `${fieldName} la bat buoc`);
  }
  return normalizedValue;
};

const parseCode = (value) => {
  const normalizedCode = normalizeCode(value);
  if (!normalizedCode) {
    throw new ApiError(400, 'code la bat buoc');
  }

  if (!/^[a-z0-9-]+$/.test(normalizedCode)) {
    throw new ApiError(400, 'code chi duoc gom chu thuong, so va dau gach ngang');
  }

  return normalizedCode;
};

const parseSortOrder = (value) => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new ApiError(400, 'sortOrder phai la so nguyen >= 0');
  }

  return value;
};

const formatCodeAsName = (code) =>
  code
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const ensureDefaultTableTypesSeeded = async () => {
  const existingTypes = await tableTypeRepository.findAll({});
  const existingCodes = new Set(existingTypes.map((item) => item.code));
  const usedCodes = await tableRepository.distinctTypeCodes();
  const codesToSeed = new Map();

  if (!existingTypes.length) {
    for (const item of DEFAULT_TABLE_TYPES) {
      codesToSeed.set(item.code, item);
    }
  }

  for (const usedCode of usedCodes) {
    const normalizedCode = normalizeCode(usedCode);
    if (!normalizedCode || existingCodes.has(normalizedCode) || codesToSeed.has(normalizedCode)) {
      continue;
    }

    codesToSeed.set(normalizedCode, {
      code: normalizedCode,
      name: formatCodeAsName(normalizedCode),
      sortOrder: codesToSeed.size + 1,
    });
  }

  await Promise.all(
    Array.from(codesToSeed.values()).map((item) =>
      tableTypeRepository.upsertByCode(item.code, item)
    )
  );
};

const getAllTableTypes = async ({ includeInactive = false } = {}) => {
  await ensureDefaultTableTypesSeeded();
  return tableTypeRepository.findAll(includeInactive ? {} : { isActive: true });
};

const getTableTypeById = async (id) => {
  await ensureDefaultTableTypesSeeded();
  const tableType = await tableTypeRepository.findById(id);
  if (!tableType) {
    throw new ApiError(404, 'Table type not found');
  }
  return tableType;
};

const ensureActiveTableTypeExists = async (code) => {
  await ensureDefaultTableTypesSeeded();
  const normalizedCode = parseCode(code);
  const tableType = await tableTypeRepository.findByCode(normalizedCode);

  if (!tableType) {
    throw new ApiError(400, 'type khong ton tai');
  }

  if (!tableType.isActive) {
    throw new ApiError(400, 'type dang bi vo hieu hoa');
  }

  return tableType;
};

const getTableTypeNameMap = async () => {
  const tableTypes = await getAllTableTypes({ includeInactive: true });
  return tableTypes.reduce((accumulator, item) => {
    accumulator[item.code] = item.name;
    return accumulator;
  }, {});
};

const createTableType = async ({ code, name, description, isActive, sortOrder }) => {
  await ensureDefaultTableTypesSeeded();

  const normalizedCode = parseCode(code);
  const existing = await tableTypeRepository.findByCode(normalizedCode);
  if (existing) {
    throw new ApiError(400, 'Table type code already exists');
  }

  return tableTypeRepository.create({
    code: normalizedCode,
    name: parseRequiredName(name, 'name'),
    description: normalizeOptionalText(description) ?? '',
    isActive: typeof isActive === 'boolean' ? isActive : true,
    sortOrder: parseSortOrder(sortOrder) ?? 0,
  });
};

const updateTableType = async (id, payload) => {
  await ensureDefaultTableTypesSeeded();

  const existing = await tableTypeRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Table type not found');
  }

  const updateData = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'code')) {
    updateData.code = parseCode(payload.code);
    if (updateData.code !== existing.code) {
      const duplicated = await tableTypeRepository.findByCode(updateData.code);
      if (duplicated) {
        throw new ApiError(400, 'Table type code already exists');
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    updateData.name = parseRequiredName(payload.name, 'name');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    updateData.description = normalizeOptionalText(payload.description) ?? '';
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
    if (typeof payload.isActive !== 'boolean') {
      throw new ApiError(400, 'isActive khong hop le');
    }
    updateData.isActive = payload.isActive;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'sortOrder')) {
    updateData.sortOrder = parseSortOrder(payload.sortOrder);
  }

  const updated = await tableTypeRepository.update(id, updateData);

  if (updateData.code && updateData.code !== existing.code) {
    await tableRepository.updateManyTypeCode(existing.code, updateData.code);
  }

  return updated;
};

const deleteTableType = async (id) => {
  await ensureDefaultTableTypesSeeded();

  const existing = await tableTypeRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Table type not found');
  }

  const isUsed = await tableRepository.existsByTypeCode(existing.code);
  if (isUsed) {
    throw new ApiError(400, 'Khong the xoa loai ban dang duoc su dung');
  }

  await tableTypeRepository.delete(id);
};

module.exports = {
  DEFAULT_TABLE_TYPES,
  ensureDefaultTableTypesSeeded,
  ensureActiveTableTypeExists,
  getAllTableTypes,
  getTableTypeById,
  getTableTypeNameMap,
  createTableType,
  updateTableType,
  deleteTableType,
};
