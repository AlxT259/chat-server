import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.emit("chatHistory", messages);
  socket.on("chatMessage", (payload) => {
    messages.push(payload);
    if (messages.length > 100) messages.shift();
    io.emit("chatMessage", payload);
  });
});

app.get("/", (req, res) => {
  res.send("Chat server is running.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('chatMessage', (msg) => {
    console.log('Received message:', msg);
    io.emit('chatMessage', msg);
  });
});

