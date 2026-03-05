import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { getDay } from "@/common/date";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface CommentItem {
  id: number;
  comment: string;
  is_reply: boolean;
  commented_at: string;
  commenter: {
    id: number;
    fullname: string;
    username: string;
    profile_img?: string;
  };
  blog: { blog_id: string; title: string };
}

const useAdminComments = (page: number) => {
  return useQuery<{
    comments: CommentItem[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-comments", page],
    queryFn: async () => {
      const res = await api.get(`/admin/comments?page=${page}&limit=20`);
      return res.data;
    },
  });
};

const useAdminDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/comments/${id}`);
    },
    onSuccess: () => {
      toast.success("Đã xóa bình luận");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Không thể xóa bình luận"),
  });
};

const CommentManagement = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminComments(page);
  const { mutate: deleteComment, isPending: isDeleting } =
    useAdminDeleteComment();

  const comments = data?.comments ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      deleteComment(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-dark-grey" />
          <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
        </div>
        <span className="text-sm text-dark-grey">Tổng: {total} bình luận</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-dark-grey">Đang tải...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-grey/10">
          <MessageSquare className="w-10 h-10 text-dark-grey/30 mx-auto mb-3" />
          <p className="text-dark-grey">Chưa có bình luận nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grey/10 overflow-hidden">
          <div className="divide-y divide-grey/10">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-4 flex gap-3 items-start group hover:bg-grey/5 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage
                    src={c.commenter?.profile_img || ""}
                    className="rounded-full object-cover w-9 h-9"
                  />
                  <AvatarFallback className="w-9 h-9 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
                    {c.commenter?.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {c.commenter?.fullname}
                    </span>
                    <span className="text-xs text-dark-grey">
                      @{c.commenter?.username}
                    </span>
                    {c.is_reply && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                        Phản hồi
                      </span>
                    )}
                    <span className="text-xs text-dark-grey">·</span>
                    <span className="text-xs text-dark-grey">
                      {getDay(c.commented_at)}
                    </span>
                  </div>

                  {/* Comment text */}
                  <p className="text-sm text-black line-clamp-2 mb-1">
                    {c.comment}
                  </p>

                  {/* Blog link */}
                  <Link
                    to={`/blog/${c.blog?.blog_id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-dark-grey hover:text-black transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[300px]">
                      {c.blog?.title}
                    </span>
                  </Link>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={isDeleting}
                  className="flex-shrink-0 p-2 text-dark-grey hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                  title="Xóa bình luận"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? "bg-black text-white"
                  : "text-dark-grey hover:bg-grey/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
