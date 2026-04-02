const CustomerRepository = require('../repositories/CustomerRepository');
const ApiError = require('../utils/apiError');

const customerRepository = new CustomerRepository();

const getAllCustomers = async () => {
  return customerRepository.findAll();
};

const getCustomerById = async (id) => {
  const customer = await customerRepository.findById(id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customer;
};

const getCustomerByPhone = async (phone) => {
  const customer = await customerRepository.findByPhone(phone);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customer;
};

const createCustomer = async ({ name, phone, email, membershipTier, notes }) => {
  const existing = await customerRepository.findByPhone(phone);
  if (existing) {
    throw new ApiError(400, 'Phone number already registered');
  }
  return customerRepository.create({ name, phone, email, membershipTier, notes });
};

const updateCustomer = async (id, updateData) => {
  if (updateData.phone) {
    const existing = await customerRepository.findByPhone(updateData.phone);
    if (existing && existing._id.toString() !== id) {
      throw new ApiError(400, 'Phone number already registered to another customer');
    }
  }
  const customer = await customerRepository.update(id, updateData);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await customerRepository.delete(id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customer;
};

const addPoints = async (id, points) => {
  if (!points || points <= 0) {
    throw new ApiError(400, 'Points must be a positive number');
  }
  const customer = await customerRepository.findById(id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  const newPoints = customer.points + points;
  const newTotalSpent = customer.totalSpent + points;
  const newTier = calculateTier(newTotalSpent);
  return customerRepository.update(id, {
    points: newPoints,
    totalSpent: newTotalSpent,
    membershipTier: newTier,
  });
};

const recordVisit = async (id) => {
  const customer = await customerRepository.findById(id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }
  return customerRepository.update(id, {
    visitCount: customer.visitCount + 1,
  });
};

const calculateTier = (totalSpent) => {
  if (totalSpent >= 10000000) return 'platinum';
  if (totalSpent >= 5000000) return 'gold';
  if (totalSpent >= 2000000) return 'silver';
  return 'bronze';
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addPoints,
  recordVisit,
};
