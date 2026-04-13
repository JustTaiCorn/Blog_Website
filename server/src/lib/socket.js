import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

/**
 * Initialize Socket.io server with JWT auth middleware
 * @param {import("http").Server} httpServer
 * @param {string[]} allowedOrigins
 */
export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          (process.env.CLIENT_URL &&
            origin.startsWith(process.env.CLIENT_URL.replace(/\/$/, "")))
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed`));
        }
      },
      credentials: true,
    },
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket] User ${userId} disconnected (${socket.id}): ${reason}`,
      );
    });
  });

  console.log("[Socket] Socket.io initialized");
  return io;
};

/**
 * Get the Socket.io server instance
 * @returns {Server}
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
};

/**
 * Emit an event to a specific user by their userId
 * @param {number} userId
 * @param {string} event
 * @param {object} data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};
