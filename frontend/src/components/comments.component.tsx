import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useComments, useAddComment } from "@/services/blogService";
import CommentCard from "./comment-card.component";
import CommentField from "./comment-field.component";
import Loader from "./loader.component";
import { Link } from "react-router-dom";

interface CommentsSectionProps {
  blog_id: string;
  totalComments: number;
}

const CommentsSection = ({ blog_id, totalComments }: CommentsSectionProps) => {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useComments(blog_id, page);
  const { mutate: addComment, isPending: isPosting } = useAddComment(blog_id);

  const comments = data?.comments ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleAddComment = (text: string) => {
    addComment(text);
  };

  return (
    <div className="mt-12 border-t border-grey/40 pt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-dark-grey" />
        <h2 className="text-lg font-semibold">
          Bình luận{" "}
          <span className="text-dark-grey font-normal">({totalComments})</span>
        </h2>
      </div>

      {/* New comment box */}
      {user ? (
        <div className="mb-8">
          <CommentField
            onSubmit={handleAddComment}
            isLoading={isPosting}
            placeholder="Chia sẻ suy nghĩ của bạn..."
          />
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-grey/20 text-center text-sm text-dark-grey">
          <Link to="/signin" className="text-black underline font-medium">
            Đăng nhập
          </Link>{" "}
          để tham gia bình luận
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-dark-grey text-sm py-8">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment: any) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              blog_id={blog_id}
              page={page}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
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

export default CommentsSection;
