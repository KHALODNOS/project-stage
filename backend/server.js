require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const novelRoutes = require("./routes/novel");
const chapterRoutes = require("./routes/chapter");
const getnovels = require("./routes/getnovels");
const searchRoutes = require("./routes/search");
const messageRoutes = require("./routes/messages");
const videoRoutes = require("./routes/video");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

const { Server } = require("socket.io");
const http = require("http");
const Message = require("./models/Message");

const app = express();

const server = http.createServer(app);
const port = 3500;

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

let onlineUsers = [];

// Verify JWT on socket handshake
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    const decoded = jwt.verify(token, process.env.ACCESS_JWT);
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error("User not found"));
    socket.user = user; // attach user to socket for use in handlers
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user as online — replace stale entry if user reconnects (new tab / refresh)
  const userId = socket.user._id.toString();
  onlineUsers = onlineUsers.filter((u) => u.userId !== userId); // remove any old entry
  onlineUsers.push({
    userId,
    nickname: socket.user.nickname,
    image: socket.user.image,
    role: socket.user.role,
    socketId: socket.id,
  });
  io.emit("getOnlineUsers", onlineUsers);

  // Send message — use server-side user, ignore any client-sent sender info
  socket.on("sendMessage", async ({ text }) => {
    if (!text || !text.trim()) return;
    try {
      const message = new Message({
        sender: socket.user._id.toString(),
        senderNickname: socket.user.nickname,
        senderImage: socket.user.image,
        senderRole: socket.user.role,
        text: text.trim(),
      });
      const savedMessage = await message.save();
      io.emit("getMessage", savedMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // React to message — use server-side userId
  socket.on("reactMessage", async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;
      const uid = socket.user._id.toString();
      // remove old reaction from same user then add new one
      message.reactions = message.reactions.filter((r) => r.userId !== uid);
      message.reactions.push({ userId: uid, emoji });
      await message.save();
      io.emit("updateMessage", message);
    } catch (err) {
      console.error("Error reacting to message:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
  });
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes
app.use("/auth", authRoutes);

app.use("/users", userRoutes);

// CRUD operations for novels

app.use("/novels", novelRoutes);
// CRUD operations for novels

app.use("/getnovels", getnovels);

// CRUD operations for chapters
app.use("/chapters", chapterRoutes);
app.use("/getnovels", getnovels);

// CRUD operations for chapters
app.use("/search", searchRoutes);

// Messages
app.use("/", messageRoutes);

// Video
app.use("/video", videoRoutes);

// 404 Handler - Return JSON instead of default HTML
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //listen to req
    server.listen(port, () => {
      console.log("connect to db and listen", port);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
