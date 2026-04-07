const FnbItemRepository = require('../repositories/FnbItemRepository');
const { ensureActiveFnbCategoryExists, getFnbCategoryNameMap } = require('./fnbCategory.service');
const ApiError = require('../utils/apiError');

const fnbItemRepository = new FnbItemRepository();

const normalizeCategory = (category) => {
  if (typeof category !== 'string') {
    return category;
  }

  return category.trim().toLowerCase();
};

const serializeFnbItem = (item, categoryNameMap = {}) => {
  if (!item) {
    return item;
  }

  const serializedItem = typeof item.toObject === 'function' ? item.toObject() : { ...item };
  const normalizedCategory = normalizeCategory(serializedItem.category);

  return {
    ...serializedItem,
    category: normalizedCategory,
    categoryLabel: categoryNameMap[normalizedCategory] || normalizedCategory,
  };
};

const getAllFnbItems = async () => {
  const categoryNameMap = await getFnbCategoryNameMap();
  const items = await fnbItemRepository.findAll();
  return items.map((item) => serializeFnbItem(item, categoryNameMap));
};

const getFnbItemById = async (id) => {
  const categoryNameMap = await getFnbCategoryNameMap();
  const item = await fnbItemRepository.findById(id);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  return serializeFnbItem(item, categoryNameMap);
};

const createFnbItem = async ({ name, category, price, image, isAvailable }) => {
  const normalizedCategory = normalizeCategory(category);
  await ensureActiveFnbCategoryExists(normalizedCategory);

  const item = await fnbItemRepository.create({
    name,
    category: normalizedCategory,
    price,
    image,
    isAvailable,
  });

  const categoryNameMap = await getFnbCategoryNameMap();
  return serializeFnbItem(item, categoryNameMap);
};

const updateFnbItem = async (id, updateData) => {
  if (Object.prototype.hasOwnProperty.call(updateData, 'category')) {
    const normalizedCategory = normalizeCategory(updateData.category);
    await ensureActiveFnbCategoryExists(normalizedCategory);
    updateData.category = normalizedCategory;
  }

  const item = await fnbItemRepository.update(id, updateData);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  const categoryNameMap = await getFnbCategoryNameMap();
  return serializeFnbItem(item, categoryNameMap);
};

const deleteFnbItem = async (id) => {
  const item = await fnbItemRepository.delete(id);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  return item;
};

module.exports = { getAllFnbItems, getFnbItemById, createFnbItem, updateFnbItem, deleteFnbItem };
