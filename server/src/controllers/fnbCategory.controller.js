const validateObjectId = require('../utils/validateObjectId');
const fnbCategoryService = require('../services/fnbCategory.service');

exports.getAllFnbCategories = async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const categories = await fnbCategoryService.getAllFnbCategories({ includeInactive });
  res.json({ success: true, data: categories });
};

exports.getFnbCategoryById = async (req, res) => {
  validateObjectId(req.params.id);
  const category = await fnbCategoryService.getFnbCategoryById(req.params.id);
  res.json({ success: true, data: category });
};

exports.createFnbCategory = async (req, res) => {
  const category = await fnbCategoryService.createFnbCategory(req.body);
  res.status(201).json({ success: true, data: category });
};

exports.updateFnbCategory = async (req, res) => {
  validateObjectId(req.params.id);
  const category = await fnbCategoryService.updateFnbCategory(req.params.id, req.body);
  res.json({ success: true, data: category });
};

exports.deleteFnbCategory = async (req, res) => {
  validateObjectId(req.params.id);
  await fnbCategoryService.deleteFnbCategory(req.params.id);
  res.json({ success: true, message: 'F&B category deleted' });
};
