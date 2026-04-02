const FnbItemRepository = require('../repositories/FnbItemRepository');
const ApiError = require('../utils/apiError');

const fnbItemRepository = new FnbItemRepository();

const getAllFnbItems = async () => {
  return fnbItemRepository.findAll();
};

const getFnbItemById = async (id) => {
  const item = await fnbItemRepository.findById(id);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  return item;
};

const createFnbItem = async ({ name, category, price, image, isAvailable }) => {
  return fnbItemRepository.create({ name, category, price, image, isAvailable });
};

const updateFnbItem = async (id, updateData) => {
  const item = await fnbItemRepository.update(id, updateData);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  return item;
};

const deleteFnbItem = async (id) => {
  const item = await fnbItemRepository.delete(id);
  if (!item) {
    throw new ApiError(404, 'F&B item not found');
  }
  return item;
};

module.exports = { getAllFnbItems, getFnbItemById, createFnbItem, updateFnbItem, deleteFnbItem };
