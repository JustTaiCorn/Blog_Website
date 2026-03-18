import api from "@/lib/axios";

export const commentService = {
  getComments: async (
    blog_id: string,
    page = 1,
    limit = 10,
  ): Promise<{
    comments: any[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get(
      `/blogs/${blog_id}/comments?page=${page}&limit=${limit}`,
    );
    return res.data;
  },

  addComment: async (
    blog_id: string,
    comment: string,
  ): Promise<{ comment: any }> => {
    const res = await api.post(`/blogs/${blog_id}/comments`, { comment });
    return res.data;
  },

  addReply: async (
    blog_id: string,
    comment_id: number,
    comment: string,
  ): Promise<{ reply: any }> => {
    const res = await api.post(
      `/blogs/${blog_id}/comments/${comment_id}/replies`,
      { comment },
    );
    return res.data;
  },

  deleteComment: async (blog_id: string, comment_id: number): Promise<void> => {
    await api.delete(`/blogs/${blog_id}/comments/${comment_id}`);
  },

  toggleCommentLike: async (
    blog_id: string,
    comment_id: number,
    type: "UP" | "DOWN",
  ): Promise<{ user_vote: "UP" | "DOWN" | null; message: string }> => {
    const res = await api.post(
      `/blogs/${blog_id}/comments/${comment_id}/like`,
      { type },
    );
    return res.data;
  },
};
