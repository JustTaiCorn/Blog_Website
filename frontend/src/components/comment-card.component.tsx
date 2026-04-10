import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MessageSquare, Trash2, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAddReply,
  useDeleteComment,
  useToggleCommentLike,
} from "@/hooks/useComment";
import CommentField from "./comment-field.component";
import { getDay } from "@/common/date.tsx";

interface CommentCardProps {
  comment: any;
  blog_id: string;
  isReply?: boolean;
  page?: number;
}

const CommentCard = ({
  comment,
  blog_id,
  isReply = false,
  page = 1,
}: CommentCardProps) => {
  const { user } = useAuthStore();
  const [showReplyField, setShowReplyField] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const { mutate: addReply, isPending: isAddingReply } = useAddReply(
    blog_id,
    comment.id,
  );
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteComment(blog_id);
  const { mutate: toggleLike, isPending: isVoting } = useToggleCommentLike(
    blog_id,
    page,
  );

  const canDelete =
    user &&
    (user.id === comment.commented_by ||
      user.roles?.some((r: any) => r.role === "ADMIN"));

  const handleReply = (text: string) => {
    addReply(text, {
      onSuccess: () => {
        setShowReplyField(false);
        setShowAllReplies(true);
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      deleteComment(comment.id);
    }
  };

  const replies: any[] = comment.replies ?? [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);

  return (
    <div className={`py-5 ${isReply ? "border-none py-3" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-8 h-8 shrink-0 mt-0.5">
          <AvatarImage
            src={comment.commenter?.profile_img || ""}
            className="rounded-full object-cover w-8 h-8"
          />
          <AvatarFallback className="w-8 h-8 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
            {comment.commenter?.fullname?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="font-medium text-sm capitalize leading-none">
              {comment.commenter?.fullname}
            </span>
            <span className="text-xs text-dark-grey leading-none">
              @{comment.commenter?.username}
            </span>
            <span className="text-xs text-dark-grey/50 leading-none">·</span>
            <span className="text-xs text-dark-grey leading-none">
              {getDay(comment.commented_at)}
            </span>
          </div>

          {/* Comment text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-black/90">
            {comment.comment}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2.5">
            {/* Like */}
            <button
              disabled={isVoting}
              onClick={() => {
                if (!user) return;
                toggleLike({ comment_id: comment.id, type: "UP" });
              }}
              title={user ? "Thích" : "Đăng nhập để thích"}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                comment.user_vote === "UP"
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-dark-grey hover:bg-grey/40"
              } ${!user ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {comment.total_likes > 0 && <span>{comment.total_likes}</span>}
            </button>

            {/* Dislike */}
            <button
              disabled={isVoting}
              onClick={() => {
                if (!user) return;
                toggleLike({ comment_id: comment.id, type: "DOWN" });
              }}
              title={user ? "Không thích" : "Đăng nhập để vote"}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                comment.user_vote === "DOWN"
                  ? "text-red-500 bg-red-50 font-medium"
                  : "text-dark-grey hover:bg-grey/40"
              } ${!user ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {comment.total_dislikes > 0 && <span>{comment.total_dislikes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyField((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-dark-grey hover:bg-grey/40 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Trả lời
                {replies.length > 0 && (
                  <span className="text-dark-grey/70">({replies.length})</span>
                )}
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-dark-grey hover:bg-red-50 hover:text-red-500 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            )}
          </div>

          {/* Reply field */}
          {showReplyField && user && (
            <div className="mt-4">
              <CommentField
                onSubmit={handleReply}
                isLoading={isAddingReply}
                placeholder={`Trả lời @${comment.commenter?.username}...`}
                onCancel={() => setShowReplyField(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {!isReply && replies.length > 0 && (
        <div className="ml-11 mt-1 pl-4 border-l-2 border-grey/40">
          {visibleReplies.map((reply: any) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              blog_id={blog_id}
              isReply
            />
          ))}
          {replies.length > 2 && (
            <button
              onClick={() => setShowAllReplies((v) => !v)}
              className="flex items-center gap-1 mt-1 text-xs text-dark-grey hover:text-black transition-colors"
            >
              {showAllReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Ẩn bớt
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Xem thêm {replies.length - 2} phản hồi
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
