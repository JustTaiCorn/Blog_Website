import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/followService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useFollowStatus = (username: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["follow-status", username],
    queryFn: () => followService.getFollowStatus(username),
    enabled: !!user && !!username && user.username !== username,
  });
};

export const useFollowCounts = (username: string) => {
  return useQuery({
    queryKey: ["follow-counts", username],
    queryFn: () => followService.getFollowCounts(username),
    enabled: !!username,
  });
};

export const useToggleFollow = (username: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followService.toggleFollow(username),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["follow-status", username],
      });
      await queryClient.cancelQueries({
        queryKey: ["follow-counts", username],
      });

      const previousStatus = queryClient.getQueryData<{
        is_following: boolean;
      }>(["follow-status", username]);
      const previousCounts = queryClient.getQueryData<{
        followers_count: number;
        following_count: number;
      }>(["follow-counts", username]);

      if (previousStatus) {
        queryClient.setQueryData(["follow-status", username], {
          is_following: !previousStatus.is_following,
        });
      }
      if (previousCounts) {
        queryClient.setQueryData(["follow-counts", username], {
          ...previousCounts,
          followers_count:
            previousCounts.followers_count +
            (previousStatus?.is_following ? -1 : 1),
        });
      }

      return { previousStatus, previousCounts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ["follow-status", username],
          context.previousStatus,
        );
      }
      if (context?.previousCounts) {
        queryClient.setQueryData(
          ["follow-counts", username],
          context.previousCounts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["follow-status", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-counts", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};
