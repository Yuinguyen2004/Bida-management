const authService = require('../services/auth.service');
const ApiError = require('../utils/apiError');

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
const USER_ROLES = ['admin', 'staff'];

const ensureString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateRegisterPayload = (body) => {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'Du lieu dang ky khong hop le');
  }

  const username = ensureString(body.username);
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = ensureString(body.fullName);
  const email = ensureString(body.email).toLowerCase();
  const role = body.role ? ensureString(body.role).toLowerCase() : 'staff';

  if (!username || username.length < 3) {
    throw new ApiError(400, 'Username phai co it nhat 3 ky tu');
  }

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password phai co it nhat 6 ky tu');
  }

  if (!fullName) {
    throw new ApiError(400, 'Ho ten la bat buoc');
  }

  if (!email) {
    throw new ApiError(400, 'Email la bat buoc');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, 'Email khong hop le');
  }

  if (!USER_ROLES.includes(role)) {
    throw new ApiError(400, 'Role khong hop le');
  }

  return { username, password, fullName, email, role };
};

const validateLoginPayload = (body) => {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'Du lieu dang nhap khong hop le');
  }

  const username = ensureString(body.username);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username) {
    throw new ApiError(400, 'Username la bat buoc');
  }

  if (!password) {
    throw new ApiError(400, 'Password la bat buoc');
  }

  return { username, password };
};

const validateRefreshTokenPayload = (body) => {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'Du lieu refresh token khong hop le');
  }

  const refreshToken = ensureString(body.refreshToken);
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token la bat buoc');
  }

  return refreshToken;
};

const register = async (req, res) => {
  const payload = validateRegisterPayload(req.body);
  const result = await authService.register(payload);
  res.status(201).json({ success: true, data: result });
};

const login = async (req, res) => {
  const payload = validateLoginPayload(req.body);
  const result = await authService.login(payload);
  res.status(200).json({ success: true, data: result });
};

const refreshToken = async (req, res) => {
  const token = validateRefreshTokenPayload(req.body);
  const result = await authService.refreshToken(token);
  res.status(200).json({ success: true, data: result });
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

module.exports = { register, login, refreshToken, getMe };
