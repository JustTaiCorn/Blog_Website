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

  const liked = data?.liked ?? false;
  const total_likes = data?.total_likes ?? 0;

  const handleLike = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    toggleLike();
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending || isLoading}
      aria-label={liked ? "Bỏ thích" : "Thích bài viết"}
      className={cn(
        "flex items-center gap-2 transition-all duration-200 group select-none",
        liked ? "text-red-500" : "text-dark-grey hover:text-red-500",
        (isPending || isLoading) && "opacity-60 cursor-not-allowed",
      )}
    >
      <Heart
        className={cn(
          "w-6 h-6 transition-all duration-200",
          liked
            ? "fill-red-500 stroke-red-500 scale-110"
            : "group-hover:scale-110",
        )}
      />
      <span className="text-xl tabular-nums">{total_likes}</span>
    </button>
  );
};

export default BlogInteraction;
