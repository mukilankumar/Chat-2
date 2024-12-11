// Libraray
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const { addUser, removeUser, getUser, getUserByEmployeeId,getUserBySocketId, getRoomUsers } = require("./entity");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const cors = require('cors');
const {getMessages, sendMessage, markMessagesAsRead, deleteMessage} = require("./crud");
const { timeStamp } = require("console");


// Instances
const app = express()
const server = http.createServer(app);
const io = socketio(server,{cors: { origin: '*' }})
app.use(express.json());
app.use(cors());


// Connect to MongoDB
mongoose.connect('mongodb+srv://hr1qsis:62X7OOFWB0jLVs3J@qsis.ndk49xu.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// End point
app.get('/',(req,res) => {
  res.json("Api is working");
})

app.post('/register', async (req, res) => {
  const { username, employeeId, password } = req.body;

  try {
    // Check if the employeeId is already taken
    if(!username|| !employeeId || !password) return res.status(400).json({error: 'send username, employeeId, password'})
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      employeeId,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }


    res.status(200).json({ message: 'Login successful',name:user.username });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get user list (excluding passwords)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users); // password is already excluded by the toJSON method
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user list' });
  }
});

// Get messages between two users
app.get('/getMessages', async (req, res) => {
  const { sender, receiver } = req.query;

  try {
    const messages = await getMessages(sender, receiver);
    res.status(200).send({ messages });
  } catch (err) {
    res.status(500).send({ error: 'Error retrieving messages' });
  }
});

// Mark messages as read
app.post('/markAsRead', async (req, res) => {
  const { sender, receiver } = req.body;

  try {
    await markMessagesAsRead(sender, receiver);
    res.status(200).send({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).send({ error: 'Error marking messages as read' });
  }
});

// Send a message
app.post('/sendMessage', async (req, res) => {
  const { sender, receiver, text } = req.body;

  try {
    const message = await sendMessage(sender, receiver, text);
    res.status(201).send({ message: 'Message sent successfully', message });
  } catch (err) {
    res.status(500).send({ error: 'Error sending message' });
  }
});


// Delete a message
app.delete('/deleteMessage', async (req, res) => {
  const { messageId } = req.body;

  try {
    const isDeleted = await deleteMessage(messageId);
    if (isDeleted) {
      res.status(200).send({ message: 'Message deleted successfully' });
    } else {
      res.status(404).send({ error: 'Message not found' });
    }
  } catch (err) {
    res.status(500).send({ error: 'Error deleting message' });
  }
});


// Socket

io.on('connect',(socket) => {
  

  socket.on('join',({user,employeeId},callback) => {
    console.log(user,employeeId);
      const {response , error} = addUser({id: socket.id , user:user, employeeId:employeeId})

      console.log(response)
      console.log(error);
      

      if(error) {
        callback(error)
        return;
      }
      socket.join(response);
      socket.emit('message', { user: 'admin' , text: `Welcome ${response.user} ` });
      socket.broadcast.to(response).emit('message', { user: 'admin', text : `${response.user} has joined` })

      socket.emit('roomMembers', getRoomUsers(response))
  })


  socket.on('sendMessage', (employeeId, message, receiverEmployeeId, callback) => {
    
    // Get the sender's user data
    const store =  sendMessage(employeeId, receiverEmployeeId, message);
    const sender = getUserByEmployeeId(employeeId); // Find sender by their socket ID (employeeId is now the socket ID)
    
    if (!sender) {
        callback('Sender not found');
        return;
    }

    // Find the receiver's user data
    const receiver = getUserByEmployeeId(receiverEmployeeId); // Lookup receiver by their employee ID
    
    if (!receiver) {
        callback('Receiver not found');
        return;
    }

    // // Emit the message to the sender (optional)
    // socket.emit('message', { sender: employeeId, text: message, receiver: receiverEmployeeId });

    // io.to(sender.id).emit('message', { sender: employeeId, text: message, receiver: receiverEmployeeId });
    io.to(receiver.id).emit('message', { sender: employeeId, text: message, receiver: receiverEmployeeId, timestamp: Date.now() });

    // Call the callback to acknowledge the message sent
    callback();
});

 

  socket.on('disconnect',() => {
    console.log("User disconnected");
    const user = removeUser(socket.id);


    if(user) {
      socket.emit('roomMembers', getRoomUsers());
      io.to(user.room).emit('message',{ user: 'admin', text : `${user.user} has left` })
    }
  })

  


  
})




server.listen(8000,() => console.log('Server started on 8000'))