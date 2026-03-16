let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("join", (target) => {
        // Support joining role rooms or personal user rooms
        socket.join(target);
        console.log(`User joined room: ${target}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
