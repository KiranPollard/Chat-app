// Required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express application
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
const dbURI = 'mongodb://localhost/chat-app';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors());
app.use(express.static(__dirname + '/../frontend/build')); // Serve React frontend

// Message Model
const Message = require('./models/message');

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit chat history when a user connects
  Message.find().then(messages => {
    socket.emit('chat history', messages);
  });

  // Handle new messages
  socket.on('chat message', (msg) => {
    const newMessage = new Message({
      username: msg.username,
      message: msg.message,
    });

    newMessage.save().then(() => {
      io.emit('chat message', newMessage);
    }).catch((err) => {
      console.error('Error saving message:', err);
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});