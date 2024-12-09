const  Message = require('./models/message.model');



// Function to send a message
const sendMessage = async (sender, receiver, messageText) => {
  const conversationId = [sender, receiver].sort().join('_');  // Ensure conversationId is unique between sender and receiver

  const newMessage = new Message({
    sender,
    receiver,
    text: messageText,
    conversationId,
    read: false  // By default, the message is unread
  });

  await newMessage.save();
  return newMessage;
};

// Function to get messages between sender and receiver
const getMessages = async (sender, receiver, limit = 20) => {
  const conversationId = [sender, receiver].sort().join('_');

  const messages = await Message.find({ conversationId })
    .sort({ timestamp: 1 })  // Sorting messages by timestamp (ascending)
    .limit(limit);  // Limit the number of messages (pagination)

  return messages;
};

// Function to mark messages as read
const markMessagesAsRead = async (sender, receiver) => {
  const conversationId = [sender, receiver].sort().join('_');

  await Message.updateMany(
    { conversationId, receiver: sender, read: false },
    { $set: { read: true } }
  );
};

// Function to delete a message
const deleteMessage = async (messageId) => {
  const result = await Message.deleteOne({ _id: messageId });
  return result.deletedCount > 0;
};


module.exports = {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage
}
