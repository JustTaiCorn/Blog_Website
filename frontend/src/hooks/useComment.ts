import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { commentService } from "@/services/commentService";

export const useComments = (blog_id: string, page = 1) => {
  return useQuery({
    queryKey: ["comments", blog_id, page],
    queryFn: () => commentService.getComments(blog_id, page),
    enabled: !!blog_id,
  });
};

export const useAddComment = (blog_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) =>
      commentService.addComment(blog_id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", blog_id] });
      queryClient.invalidateQueries({ queryKey: ["blog", blog_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể thêm bình luận");
    },
  });
};

export const useAddReply = (blog_id: string, comment_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) =>
      commentService.addReply(blog_id, comment_id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", blog_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể gửi phản hồi");
    },
  });
};

export const useDeleteComment = (blog_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment_id: number) =>
      commentService.deleteComment(blog_id, comment_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", blog_id] });
      queryClient.invalidateQueries({ queryKey: ["blog", blog_id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể xóa bình luận");
    },
  });
};

export const useToggleCommentLike = (blog_id: string, page = 1) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      comment_id,
      type,
    }: {
      comment_id: number;
      type: "UP" | "DOWN";
    }) => commentService.toggleCommentLike(blog_id, comment_id, type),

    onMutate: async ({ comment_id, type }) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", blog_id, page],
      });
      const prev = queryClient.getQueryData<any>(["comments", blog_id, page]);

      queryClient.setQueryData(["comments", blog_id, page], (old: any) => {
        if (!old) return old;
        const updateComment = (c: any): any => {
          if (c.id !== comment_id) {
            return { ...c, replies: (c.replies || []).map(updateComment) };
          }
          const wasVote = c.user_vote;
          if (wasVote === type) {
            return {
              ...c,
              user_vote: null,
              total_likes: type === "UP" ? c.total_likes - 1 : c.total_likes,
              total_dislikes:
                type === "DOWN" ? c.total_dislikes - 1 : c.total_dislikes,
            };
          } else {
            return {
              ...c,
              user_vote: type,
              total_likes:
                type === "UP"
                  ? c.total_likes + 1
                  : wasVote === "UP"
                    ? c.total_likes - 1
                    : c.total_likes,
              total_dislikes:
                type === "DOWN"
                  ? c.total_dislikes + 1
                  : wasVote === "DOWN"
                    ? c.total_dislikes - 1
                    : c.total_dislikes,
            };
          }
        };
        return { ...old, comments: old.comments.map(updateComment) };
      });

      return { prev };
    },

    onError: (_err, _vars, context: any) => {
      if (context?.prev) {
        queryClient.setQueryData(["comments", blog_id, page], context.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", blog_id, page] });
    },
  });
};
