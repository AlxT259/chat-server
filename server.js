import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());

const mongoURI = 'mongodb+srv://alxt259:alx2593012@chat-cluster.1cs5zah.mongodb.net/chatdb?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  ts: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  Message.find().sort({ ts: 1 }).limit(100).then(history => {
    socket.emit("chatHistory", history);
  });

  socket.on("chatMessage", async (payload) => {
    const msg = new Message(payload);
    await msg.save();
    io.emit("chatMessage", msg);
  });
});

app.get("/", (req, res) => {
  res.send("Chat server is running.");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
