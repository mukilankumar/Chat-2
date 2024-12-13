const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
    group: { 
      type: String,
      required: true
    },
    sender: { 
      type: String, 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    } 
  });

  const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);
  
  
  module.exports = GroupMessage;