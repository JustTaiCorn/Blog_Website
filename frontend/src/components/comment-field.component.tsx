import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useAuthStore } from "@/stores/useAuthStore";

interface CommentFieldProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

const CommentField = ({
  onSubmit,
  isLoading = false,
  placeholder = "Thêm bình luận...",
  onCancel,
  autoFocus = false,
}: CommentFieldProps) => {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
        <AvatarImage
          src={user?.profile_img || ""}
          className="rounded-full object-cover w-9 h-9"
        />
        <AvatarFallback className="w-9 h-9 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
          {user?.fullname?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={2}
          className="w-full resize-none rounded-xl border border-grey/40 bg-transparent px-4 py-3 text-sm text-black placeholder:text-dark-grey focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
        />
        <div className="flex justify-end items-center gap-2 mt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-1.5 text-sm text-dark-grey hover:text-black transition-colors rounded-lg"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="px-5 py-1.5 text-sm font-medium rounded-full bg-black text-white disabled:opacity-40 hover:bg-dark-grey transition-colors"
          >
            {isLoading ? "Đang gửi..." : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentField;
