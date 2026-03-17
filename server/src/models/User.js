const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username la bat buoc'],
    unique: true,
    trim: true,
    minlength: [3, 'Username phai co it nhat 3 ky tu'],
  },
  password: {
    type: String,
    required: [true, 'Password la bat buoc'],
    minlength: [6, 'Password phai co it nhat 6 ky tu'],
  },
  fullName: {
    type: String,
    required: [true, 'Ho ten la bat buoc'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
