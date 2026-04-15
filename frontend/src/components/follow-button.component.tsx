import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface FollowButtonProps {
  username: string;
  className?: string;
  size?: "sm" | "default";
}

const FollowButton = ({
  username,
  className,
  size = "default",
}: FollowButtonProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const { data: statusData, isLoading: statusLoading } =
    useFollowStatus(username);
  const { mutate: toggleFollow, isPending } = useToggleFollow(username);
  if (user?.username === username) return null;

  const isFollowing = statusData?.is_following ?? false;

  const handleClick = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    toggleFollow();
  };

  if (statusLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("min-w-[100px]", className)}
      >
        <Spinner className="size-4" />
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <Button
        variant={isHovered ? "destructive" : "secondary"}
        size={size}
        onClick={handleClick}
        disabled={isPending}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "min-w-[110px] transition-all duration-200 cursor-pointer",
          className,
        )}
      >
        {isPending ? (
          <Spinner className="size-4 mr-1.5" />
        ) : isHovered ? (
          <UserMinus className="size-4 mr-1.5" />
        ) : (
          <UserCheck className="size-4 mr-1.5" />
        )}
        {isPending ? "..." : isHovered ? "Unfollow" : "Following"}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "min-w-[100px] transition-all duration-200 cursor-pointer",
        className,
      )}
    >
      {isPending ? (
        <Spinner className="size-4 mr-1.5" />
      ) : (
        <UserPlus className="size-4 mr-1.5" />
      )}
      {isPending ? "..." : "Follow"}
    </Button>
  );
};

export default FollowButton;
