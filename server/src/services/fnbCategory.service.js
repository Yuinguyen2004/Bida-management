const FnbCategoryRepository = require('../repositories/FnbCategoryRepository');
const FnbItemRepository = require('../repositories/FnbItemRepository');
const ApiError = require('../utils/apiError');

const fnbCategoryRepository = new FnbCategoryRepository();
const fnbItemRepository = new FnbItemRepository();

const DEFAULT_FNB_CATEGORIES = [
  { code: 'food', name: 'Food', sortOrder: 1 },
  { code: 'beverage', name: 'Beverage', sortOrder: 2 },
  { code: 'nuoc', name: 'Nuoc', sortOrder: 3 },
  { code: 'bia', name: 'Bia', sortOrder: 4 },
  { code: 'snack', name: 'Snack', sortOrder: 5 },
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

const ensureDefaultFnbCategoriesSeeded = async () => {
  const existingCategories = await fnbCategoryRepository.findAll({});
  const existingCodes = new Set(existingCategories.map((item) => item.code));
  const usedCodes = await fnbItemRepository.distinctCategoryCodes();
  const codesToSeed = new Map();

  if (!existingCategories.length) {
    for (const item of DEFAULT_FNB_CATEGORIES) {
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
      fnbCategoryRepository.upsertByCode(item.code, item)
    )
  );
};

const getAllFnbCategories = async ({ includeInactive = false } = {}) => {
  await ensureDefaultFnbCategoriesSeeded();
  return fnbCategoryRepository.findAll(includeInactive ? {} : { isActive: true });
};

const getFnbCategoryById = async (id) => {
  await ensureDefaultFnbCategoriesSeeded();
  const category = await fnbCategoryRepository.findById(id);
  if (!category) {
    throw new ApiError(404, 'F&B category not found');
  }
  return category;
};

const ensureActiveFnbCategoryExists = async (code) => {
  await ensureDefaultFnbCategoriesSeeded();
  const normalizedCode = parseCode(code);
  const category = await fnbCategoryRepository.findByCode(normalizedCode);

  if (!category) {
    throw new ApiError(400, 'category khong ton tai');
  }

  if (!category.isActive) {
    throw new ApiError(400, 'category dang bi vo hieu hoa');
  }

  return category;
};

const getFnbCategoryNameMap = async () => {
  const categories = await getAllFnbCategories({ includeInactive: true });
  return categories.reduce((accumulator, item) => {
    accumulator[item.code] = item.name;
    return accumulator;
  }, {});
};

const createFnbCategory = async ({ code, name, description, isActive, sortOrder }) => {
  await ensureDefaultFnbCategoriesSeeded();

  const normalizedCode = parseCode(code);
  const existing = await fnbCategoryRepository.findByCode(normalizedCode);
  if (existing) {
    throw new ApiError(400, 'F&B category code already exists');
  }

  return fnbCategoryRepository.create({
    code: normalizedCode,
    name: parseRequiredName(name, 'name'),
    description: normalizeOptionalText(description) ?? '',
    isActive: typeof isActive === 'boolean' ? isActive : true,
    sortOrder: parseSortOrder(sortOrder) ?? 0,
  });
};

const updateFnbCategory = async (id, payload) => {
  await ensureDefaultFnbCategoriesSeeded();

  const existing = await fnbCategoryRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'F&B category not found');
  }

  const updateData = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'code')) {
    updateData.code = parseCode(payload.code);
    if (updateData.code !== existing.code) {
      const duplicated = await fnbCategoryRepository.findByCode(updateData.code);
      if (duplicated) {
        throw new ApiError(400, 'F&B category code already exists');
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

  const updated = await fnbCategoryRepository.update(id, updateData);

  if (updateData.code && updateData.code !== existing.code) {
    await fnbItemRepository.updateManyCategoryCode(existing.code, updateData.code);
  }

  return updated;
};

const deleteFnbCategory = async (id) => {
  await ensureDefaultFnbCategoriesSeeded();

  const existing = await fnbCategoryRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'F&B category not found');
  }

  const isUsed = await fnbItemRepository.existsByCategoryCode(existing.code);
  if (isUsed) {
    throw new ApiError(400, 'Khong the xoa category dang duoc su dung');
  }

  await fnbCategoryRepository.delete(id);
};

module.exports = {
  DEFAULT_FNB_CATEGORIES,
  ensureDefaultFnbCategoriesSeeded,
  ensureActiveFnbCategoryExists,
  getAllFnbCategories,
  getFnbCategoryById,
  getFnbCategoryNameMap,
  createFnbCategory,
  updateFnbCategory,
  deleteFnbCategory,
};
