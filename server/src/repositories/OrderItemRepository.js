const OrderItem = require('../models/OrderItem');

class OrderItemRepository {
  async findBySessionId(sessionId) {
    return OrderItem.find({ sessionId }).populate('fnbItemId');
  }

  async create(data) {
    return OrderItem.create(data);
  }

  async delete(id) {
    return OrderItem.findByIdAndDelete(id);
  }
}

module.exports = OrderItemRepository;
