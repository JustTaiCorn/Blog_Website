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
  const [focused, setFocused] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setText("");
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0 mt-1">
        <AvatarImage
          src={user?.profile_img || ""}
          className="rounded-full object-cover w-8 h-8"
        />
        <AvatarFallback className="w-8 h-8 rounded-full bg-grey flex items-center justify-center text-sm font-medium">
          {user?.fullname?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={focused || text ? 3 : 1}
          className="w-full resize-none rounded-xl border border-grey/60 bg-transparent px-3.5 py-2.5 text-sm placeholder:text-dark-grey focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
        />

        {(focused || text) && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-dark-grey/60">Ctrl + Enter để gửi</span>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3.5 py-1.5 text-sm text-dark-grey hover:text-black rounded-lg hover:bg-grey/30 transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isLoading}
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-black text-white disabled:opacity-30 hover:bg-dark-grey transition-colors"
              >
                {isLoading ? "Đang gửi..." : "Đăng"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentField;
