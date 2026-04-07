const FnbItem = require('../models/FnbItem');

class FnbItemRepository {
  async findAll() {
    return FnbItem.find();
  }

  async findById(id) {
    return FnbItem.findById(id);
  }

  async create(data) {
    return FnbItem.create(data);
  }

  async existsByCategoryCode(category) {
    return FnbItem.exists({ category });
  }

  async distinctCategoryCodes() {
    return FnbItem.distinct('category');
  }

  async update(id, updateData) {
    return FnbItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateManyCategoryCode(oldCode, newCode) {
    return FnbItem.updateMany({ category: oldCode }, { $set: { category: newCode } });
  }

  async delete(id) {
    return FnbItem.findByIdAndDelete(id);
  }
}

module.exports = FnbItemRepository;
