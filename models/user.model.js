const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('UserList', userSchema);

module.exports = User;
