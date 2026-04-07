const ApiError = require('../utils/apiError');

const role = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Vui long dang nhap'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Khong co quyen truy cap'));
    }
    next();
  };
};

module.exports = role;
