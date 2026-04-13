import api from "@/lib/axios";
import type {
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/notification";

export const notificationService = {
  getNotifications: async (params: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<NotificationsResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page ?? 1));
    searchParams.set("limit", String(params.limit ?? 15));
    if (params.type) searchParams.set("type", params.type);

    const res = await api.get<NotificationsResponse>(
      `/notifications?${searchParams.toString()}`,
    );
    return res.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await api.get<UnreadCountResponse>(
      "/notifications/unread-count",
    );
    return res.data;
  },

  markAsRead: async (id: number): Promise<{ message: string }> => {
    const res = await api.patch<{ message: string }>(
      `/notifications/${id}/read`,
    );
    return res.data;
  },

  markAllAsRead: async (type?: string): Promise<{ message: string }> => {
    const params = type ? `?type=${type}` : "";
    const res = await api.patch<{ message: string }>(
      `/notifications/read-all${params}`,
    );
    return res.data;
  },
};
