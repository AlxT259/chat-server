const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  },
  // pingInterval/pingTimeout можно тонко настроить позже
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chatMessage', (payload) => {
    // payload может быть объектом { user, text, ts }
    io.emit('chatMessage', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, reason);
  });
});

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
