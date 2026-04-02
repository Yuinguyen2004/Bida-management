const Session = require('../models/Session');

class SessionRepository {
  async findById(id) {
    return Session.findById(id).populate('tableId').populate('staffId', '-password');
  }

  async findByFilter(filter) {
    return Session.find(filter)
      .populate('tableId')
      .populate('staffId', '-password')
      .sort({ createdAt: -1 });
  }

  async create(data) {
    return Session.create(data);
  }

  async update(id, updateData) {
    return Session.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async aggregate(pipeline) {
    return Session.aggregate(pipeline);
  }
}

module.exports = SessionRepository;
