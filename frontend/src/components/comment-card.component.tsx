import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MessageSquare, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAddReply,
  useDeleteComment,
  useToggleCommentLike,
} from "@/services/commentService";
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
    <div className={`${isReply ? "ml-12 mt-3" : ""}`}>
      <div className="flex gap-3 group">
        {/* Avatar */}
        <Avatar className="w-9 h-9 flex-shrink-0 mt-0.5">
          <AvatarImage
            src={comment.commenter?.profile_img || ""}
            className="rounded-full object-cover w-9 h-9"
          />
          <AvatarFallback className="w-9 h-9 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
            {comment.commenter?.fullname?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm capitalize">
              {comment.commenter?.fullname}
            </span>
            <span className="text-xs text-dark-grey">
              @{comment.commenter?.username}
            </span>
            <span className="text-xs text-dark-grey">·</span>
            <span className="text-xs text-dark-grey">
              {getDay(comment.commented_at)}
            </span>
          </div>

          {/* Comment text */}
          <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
            {comment.comment}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {/* Like / Dislike */}
            <button
              disabled={isVoting}
              onClick={() => {
                if (!user) return;
                toggleLike({ comment_id: comment.id, type: "UP" });
              }}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.user_vote === "UP"
                  ? "text-blue-500 font-medium"
                  : "text-dark-grey hover:text-blue-500"
              } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              title={user ? "Thích" : "Đăng nhập để thích"}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {comment.total_likes > 0 && <span>{comment.total_likes}</span>}
            </button>

            <button
              disabled={isVoting}
              onClick={() => {
                if (!user) return;
                toggleLike({ comment_id: comment.id, type: "DOWN" });
              }}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.user_vote === "DOWN"
                  ? "text-red-500 font-medium"
                  : "text-dark-grey hover:text-red-500"
              } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              title={user ? "Không thích" : "Đăng nhập để vote"}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {comment.total_dislikes > 0 && (
                <span>{comment.total_dislikes}</span>
              )}
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyField((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-dark-grey hover:text-black transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Trả lời
                {replies.length > 0 && (
                  <span className="text-dark-grey">({replies.length})</span>
                )}
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-600 hover:scale-105"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            )}
          </div>

          {/* Reply field */}
          {showReplyField && user && (
            <div className="mt-3">
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
        <div className="mt-2">
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
              className="ml-12 mt-2 text-xs text-dark-grey hover:text-black transition-colors"
            >
              {showAllReplies
                ? "Ẩn bớt"
                : `Xem thêm ${replies.length - 2} phản hồi`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
