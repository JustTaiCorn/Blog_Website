import { Heart, MessageCircle, Reply, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useMarkAsRead } from "@/hooks/useNotification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import type { NotificationItem as NotificationItemType } from "@/types/notification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const typeConfig = {
  like: {
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    message: "đã thích bài viết của bạn",
  },
  comment: {
    icon: MessageCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    message: "đã bình luận vào bài viết của bạn",
  },
  reply: {
    icon: Reply,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    message: "đã phản hồi bình luận của bạn",
  },
  follow: {
    icon: UserPlus,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    message: "đã follow bạn",
  },
};

interface NotificationItemProps {
  notification: NotificationItemType;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.seen) {
      markAsRead.mutate(notification.id);
    }
    if (notification.type === "follow") {
      navigate(`/@${notification.actor.username}`);
    } else if (notification.blog) {
      navigate(`/blog/${notification.blog.blog_id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
        !notification.seen
          ? "bg-blue-50/40 border-l-4 border-l-blue-500"
          : "border-l-4 border-l-transparent"
      }`}
    >
      {/* Actor Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={notification.actor.profile_img || undefined}
            alt={notification.actor.username}
          />
          <AvatarFallback className="text-sm font-medium bg-gray-200">
            {notification.actor.fullname?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Type icon badge */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${config.bgColor}`}
        >
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          <span className="font-semibold">{notification.actor.fullname}</span>{" "}
          {config.message}
        </p>
        <p className="text-sm text-gray-500 truncate mt-0.5">
          {notification.blog ? `"${notification.blog.title}"` : ""}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {dayjs(notification.created_at).fromNow()}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.seen && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        </div>
      )}
    </button>
  );
};

export default NotificationItem;
