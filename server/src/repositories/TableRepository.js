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

  async existsByTypeCode(type) {
    return Table.exists({ type });
  }

  async distinctTypeCodes() {
    return Table.distinct('type');
  }

  async update(id, updateData) {
    return Table.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateManyTypeCode(oldCode, newCode) {
    return Table.updateMany({ type: oldCode }, { $set: { type: newCode } });
  }

  async delete(id) {
    return Table.findByIdAndDelete(id);
  }
}

module.exports = TableRepository;
