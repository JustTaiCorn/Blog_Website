import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useUnreadCount } from "@/hooks/useNotification";
import type { NotificationNewPayload } from "@/types/notification";

/**
 * Top-level hook that manages Socket.io connection lifecycle
 * and listens for realtime notification events.
 *
 * Mount this once in App.tsx or MainLayout.
 */
export const useSocketNotification = () => {
  const { accessToken, user } = useAuthStore();
  const { increment } = useNotificationStore();
  const connectedRef = useRef(false);

  // Fetch initial unread count when authenticated
  useUnreadCount();

  useEffect(() => {
    if (!accessToken || !user) {
      // Not authenticated — disconnect if connected
      if (connectedRef.current) {
        disconnectSocket();
        connectedRef.current = false;
      }
      return;
    }

    // Connect socket
    const socket = connectSocket(accessToken);
    connectedRef.current = true;

    // Listen for new notifications
    const handleNewNotification = (_data: NotificationNewPayload) => {
      increment();
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      const s = getSocket();
      if (s) {
        s.off("notification:new", handleNewNotification);
      }
    };
  }, [accessToken, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, []);
};
