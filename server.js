import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const uri = "mongodb+srv://alxt259:alx2593012@chat-cluster.1cs5zah.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, { dbName: "chatDB" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  ts: Number
});
const Message = mongoose.model("Message", messageSchema);

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);
  const history = await Message.find().sort({ ts: 1 }).limit(100);
  socket.emit("chatHistory", history);

  socket.on("chatMessage", async (payload) => {
    const msg = new Message(payload);
    await msg.save();
    io.emit("chatMessage", payload);
  });
});

app.get("/", (req, res) => {
  res.send("Chat server with MongoDB is running.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
