const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const User = require("./model/userModel");
const userRoutes = require("./routes/userRouter");
const chatRoutes = require("./routes/chatRouter");
const messageRoutes = require("./routes/messageRouter");
const connectDB = require("./utils/connectDB");
const path = require("path");

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "success" });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//--------------- Deployment -----------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

//--------------- Deployment -----------------

app.use((req, res, next) => {
  const error = new Error(`Not Found ${req.originalUrl}`);
  res.status(404);
  next(error);
});
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const server = app.listen(process.env.PORT || 5000);
console.log(`server is listening on port ${process.env.PORT || 5000}`);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: `http://localhost:${process.env.PORT || 5000}`,
  },
});

io.on("connection", (socket) => {
  console.log("socket connected");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("user joined", userData._id);
    socket.emit("connected");
  });
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log("joined room", roomId);
  });
  // socket.on("typing", (room) => {
  //   socket.in(room).emit("typing");
  // });
  // socket.on("stop typing", (room) => {
  //   socket.in(room).emit("stop typing");
  // });

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chatId;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });
  socket.off("setup", () => {
    console.log("socket disconnected");
    socket.leave(userData._id);
  });
});
