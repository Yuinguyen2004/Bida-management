const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const ApiError = require('../utils/apiError');

const userRepository = new UserRepository();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
  return { accessToken, refreshToken };
};

const register = async ({ username, password, fullName, role }) => {
  const existing = await userRepository.findByUsername(username);
  if (existing) {
    throw new ApiError(400, 'Username da ton tai');
  }

  const user = await userRepository.create({ username, password, fullName, role });
  const tokens = generateTokens(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, ...tokens };
};

const login = async ({ username, password }) => {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new ApiError(401, 'Username hoac password khong dung');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Username hoac password khong dung');
  }

  const tokens = generateTokens(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, ...tokens };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new ApiError(400, 'Refresh token la bat buoc');
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await userRepository.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Nguoi dung khong ton tai');
  }

  const tokens = generateTokens(user._id);
  return tokens;
};

module.exports = { register, login, refreshToken };
