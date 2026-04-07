const FnbCategory = require('../models/FnbCategory');

class FnbCategoryRepository {
  async findAll(query = {}) {
    return FnbCategory.find(query).sort({ sortOrder: 1, name: 1 });
  }

  async findById(id) {
    return FnbCategory.findById(id);
  }

  async findByCode(code) {
    return FnbCategory.findOne({ code });
  }

  async create(data) {
    return FnbCategory.create(data);
  }

  async update(id, updateData) {
    return FnbCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return FnbCategory.findByIdAndDelete(id);
  }

  async upsertByCode(code, insertData) {
    return FnbCategory.findOneAndUpdate(
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

module.exports = FnbCategoryRepository;
