const Table = require('../models/Table');

class TableRepository {
  async findAll() {
    return Table.find();
  }

  async findById(id) {
    return Table.findById(id);
  }

  async findOne(query) {
    return Table.findOne(query);
  }

  async create(tableData) {
    return Table.create(tableData);
  }

  async update(id, updateData) {
    return Table.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Table.findByIdAndDelete(id);
  }
}

module.exports = TableRepository;
