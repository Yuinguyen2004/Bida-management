const fnbService = require('../services/fnb.service');

exports.getAllFnbItems = async (req, res, next) => {
  try {
    const items = await fnbService.getAllFnbItems();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.getFnbItemById = async (req, res, next) => {
  try {
    const item = await fnbService.getFnbItemById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.createFnbItem = async (req, res, next) => {
  try {
    const { name, category, price, image, isAvailable } = req.body;
    const item = await fnbService.createFnbItem({ name, category, price, image, isAvailable });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateFnbItem = async (req, res, next) => {
  try {
    const item = await fnbService.updateFnbItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteFnbItem = async (req, res, next) => {
  try {
    await fnbService.deleteFnbItem(req.params.id);
    res.json({ success: true, message: 'F&B item deleted' });
  } catch (error) {
    next(error);
  }
};
