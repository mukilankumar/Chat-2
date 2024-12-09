const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
    sender: { 
        type: String,  // Assuming 'sender' is the employeeId
        required: true 
    },
    receiver: { 
        type: String,  // Assuming 'receiver' is the employeeId
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    conversationId: { 
        type: String, // A unique ID for each conversation
        required: true
    }
});

messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 }); // Compound index for fast retrieval based on sender, receiver, and timestamp.
messageSchema.index({ conversationId: 1, timestamp: 1 }); // Compound index for querying all messages in a conversation ordered by timestamp.


// Create a model based on the schema
const Message = mongoose.model('Message', messageSchema);


module.exports = Message;


