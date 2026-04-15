import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { useLikeStatus, useToggleLike } from "@/hooks/useBlog";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BlogInteractionProps {
  blog_id: string;
}

const BlogInteraction = ({ blog_id }: BlogInteractionProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data, isLoading } = useLikeStatus(blog_id);
  const { mutate: toggleLike, isPending } = useToggleLike(blog_id);
  const [showBurst, setShowBurst] = useState(false);

  const liked = data?.liked ?? false;
  const total_likes = data?.total_likes ?? 0;

  const handleLike = useCallback(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (!liked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }

    toggleLike();
  }, [user, liked, navigate, toggleLike]);

  return (
    <button
      onClick={handleLike}
      disabled={isPending || isLoading}
      aria-label={liked ? "Bỏ thích" : "Thích bài viết"}
      className={cn(
        "relative inline-flex items-center gap-2 py-1.5 pl-2.5 pr-3.5 rounded-full text-sm font-semibold select-none",
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer",
        "border-none outline-none bg-transparent",
        liked
          ? "text-[hsl(7,100%,54%)] bg-[hsl(11,100%,96%)]"
          : "text-[var(--tt-gray-light-500)] hover:text-[hsl(7,100%,54%)] hover:bg-[hsl(11,100%,96%)]",
        (isPending || isLoading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart
        className={cn(
          "w-[22px] h-[22px] transition-transform duration-200",
          "group-hover:scale-110",
          showBurst && "[animation:heartBurst_0.6s_cubic-bezier(0.4,0,0.2,1)]"
        )}
        fill={liked ? "currentColor" : "none"}
        strokeWidth={liked ? 0 : 2}
      />
      <span className="tabular-nums leading-none">{total_likes}</span>

      {showBurst && (
        <span
          className="absolute top-1/2 left-[22px] w-6 h-6 rounded-full border-2 border-[hsl(9,100%,73%)] pointer-events-none [animation:ringBurst_0.5s_ease-out_forwards]"
        />
      )}
    </button>
  );
};

export default BlogInteraction;
