const fnbService = require('../services/fnb.service');

exports.getAllFnbItems = async (req, res) => {
  const items = await fnbService.getAllFnbItems();
  res.json({ success: true, data: items });
};

exports.getFnbItemById = async (req, res) => {
  const item = await fnbService.getFnbItemById(req.params.id);
  res.json({ success: true, data: item });
};

exports.createFnbItem = async (req, res) => {
  const { name, category, price, image, isAvailable } = req.body;
  const item = await fnbService.createFnbItem({ name, category, price, image, isAvailable });
  res.status(201).json({ success: true, data: item });
};

exports.updateFnbItem = async (req, res) => {
  const item = await fnbService.updateFnbItem(req.params.id, req.body);
  res.json({ success: true, data: item });
};

exports.deleteFnbItem = async (req, res) => {
  await fnbService.deleteFnbItem(req.params.id);
  res.json({ success: true, message: 'F&B item deleted' });
};
