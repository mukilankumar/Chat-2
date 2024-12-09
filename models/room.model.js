const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    unique: true
  },
  groupName: {
    type: String, // Group name for the chat room
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
