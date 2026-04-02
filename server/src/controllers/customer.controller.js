const customerService = require('../services/customer.service');

exports.getAllCustomers = async (req, res) => {
  const customers = await customerService.getAllCustomers();
  res.json({ success: true, data: customers });
};

exports.getCustomerById = async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
};

exports.getCustomerByPhone = async (req, res) => {
  const customer = await customerService.getCustomerByPhone(req.params.phone);
  res.json({ success: true, data: customer });
};

exports.createCustomer = async (req, res) => {
  const { name, phone, email, membershipTier, notes } = req.body;
  const customer = await customerService.createCustomer({ name, phone, email, membershipTier, notes });
  res.status(201).json({ success: true, data: customer });
};

exports.updateCustomer = async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, data: customer });
};

exports.deleteCustomer = async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
};

exports.addPoints = async (req, res) => {
  const customer = await customerService.addPoints(req.params.id, req.body.points);
  res.json({ success: true, data: customer });
};

exports.recordVisit = async (req, res) => {
  const customer = await customerService.recordVisit(req.params.id);
  res.json({ success: true, data: customer });
};
