import { useState } from "react";
import { MessageCircle, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useComments, useAddComment } from "@/hooks/useComment";
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
    <section className="mt-16 border-t border-grey pt-10">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <MessageCircle className="w-5 h-5" strokeWidth={2} />
        <h2 className="text-xl font-semibold tracking-tight">
          Bình luận
        </h2>
        <span className="ml-1 text-sm font-normal text-dark-grey bg-grey/40 px-2.5 py-0.5 rounded-full">
          {totalComments}
        </span>
      </div>

      {/* Comment input */}
      {user ? (
        <div className="mb-10">
          <CommentField
            onSubmit={handleAddComment}
            isLoading={isPosting}
            placeholder="Chia sẻ suy nghĩ của bạn..."
          />
        </div>
      ) : (
        <Link
          to="/signin"
          className="flex items-center gap-3 mb-10 p-4 rounded-xl border border-grey/60 hover:border-black/30 hover:bg-grey/10 transition-all group"
        >
          <div className="w-9 h-9 rounded-full bg-grey/40 flex items-center justify-center shrink-0 group-hover:bg-grey/60 transition-colors">
            <LogIn className="w-4 h-4 text-dark-grey" />
          </div>
          <span className="text-sm text-dark-grey">
            <span className="text-black font-medium">Đăng nhập</span> để tham gia bình luận
          </span>
        </Link>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-dark-grey gap-2">
          <MessageCircle className="w-8 h-8 opacity-30" />
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="divide-y divide-grey/40">
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
        <div className="flex justify-center items-center gap-1.5 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                p === page
                  ? "bg-black text-white"
                  : "text-dark-grey hover:bg-grey/40"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
