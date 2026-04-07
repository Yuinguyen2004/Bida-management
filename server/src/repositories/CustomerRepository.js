const Customer = require('../models/Customer');

class CustomerRepository {
  async findAll() {
    return Customer.find();
  }

  async findById(id) {
    return Customer.findById(id);
  }

  async findByPhone(phone) {
    return Customer.findOne({ phone });
  }

  async create(data) {
    return Customer.create(data);
  }

  async update(id, updateData) {
    return Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Customer.findByIdAndDelete(id);
  }
}

module.exports = CustomerRepository;
