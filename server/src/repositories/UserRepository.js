const User = require('../models/User');

class UserRepository {
  async findByUsername(username) {
    return User.findOne({ username });
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id).select('-password');
  }

  async create(userData) {
    return User.create(userData);
  }
}

module.exports = UserRepository;
