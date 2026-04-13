import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";

const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SERVER_URL, {
    autoConnect: false,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", async (err) => {
    console.error("[Socket] Connection error:", err.message);

    // If auth error, try refreshing token and reconnecting
    if (err.message.includes("token") || err.message.includes("Authentication")) {
      try {
        const newToken = useAuthStore.getState().accessToken;
        if (newToken && socket) {
          socket.auth = { token: newToken };
        }
      } catch {
        disconnectSocket();
      }
    }
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
