const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const ApiError = require('../utils/apiError');

const userRepository = new UserRepository();

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Vui long dang nhap');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'Nguoi dung khong ton tai');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
