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
  email: {
    type: String,
    required: [true, 'Email la bat buoc'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email khong hop le'],
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

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = userSchema;
