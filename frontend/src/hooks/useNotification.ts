import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useNotificationStore } from "@/stores/useNotificationStore";

// ==================== Query Hooks ====================

export const useNotifications = (type?: string) => {
  return useInfiniteQuery({
    queryKey: ["notifications", type],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotifications({
        page: pageParam,
        limit: 15,
        type,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const useUnreadCount = () => {
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: async () => {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count);
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // Poll every 60s as fallback
  });
};

// ==================== Mutation Hooks ====================

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { decrement } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      decrement();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { reset } = useNotificationStore();

  return useMutation({
    mutationFn: (type?: string) => notificationService.markAllAsRead(type),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};
