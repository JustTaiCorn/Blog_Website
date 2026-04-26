import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useUnreadCount } from "@/hooks/useNotification";
import type { NotificationNewPayload } from "@/types/notification";

export const useSocketNotification = () => {
  const { accessToken, user } = useAuthStore();
  const { increment } = useNotificationStore();
  const connectedRef = useRef(false);
  useUnreadCount();
  useEffect(() => {
    if (!accessToken || !user) {
      if (connectedRef.current) {
        disconnectSocket();
        connectedRef.current = false;
      }
      return;
    }

    const socket = connectSocket(accessToken);
    connectedRef.current = true;
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

  useEffect(() => {
    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, []);
};
