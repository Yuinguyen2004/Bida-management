const TableType = require('../models/TableType');

class TableTypeRepository {
  async findAll(query = {}) {
    return TableType.find(query).sort({ sortOrder: 1, name: 1 });
  }

  async findById(id) {
    return TableType.findById(id);
  }

  async findByCode(code) {
    return TableType.findOne({ code });
  }

  async create(data) {
    return TableType.create(data);
  }

  async update(id, updateData) {
    return TableType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return TableType.findByIdAndDelete(id);
  }

  async upsertByCode(code, insertData) {
    return TableType.findOneAndUpdate(
      { code },
      { $setOnInsert: insertData },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }
}

module.exports = TableTypeRepository;
