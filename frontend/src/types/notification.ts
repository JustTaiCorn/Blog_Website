import type { NotificationType } from "./entities";

export interface NotificationActor {
  id: number;
  username: string;
  fullname: string;
  profile_img: string | null;
}

export interface NotificationBlog {
  blog_id: string;
  title: string;
  slug: string;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  seen: boolean;
  created_at: string;
  updated_at: string;
  blog_id: number;
  notification_for: number;
  user_id: number;
  comment_id: number | null;
  reply_id: number | null;
  replied_on_comment_id: number | null;
  actor: NotificationActor;
  blog: NotificationBlog | null;
  comment?: { id: number; comment: string } | null;
  reply?: { id: number; comment: string } | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  totalPages: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// Socket event payload
export interface NotificationNewPayload {
  type: NotificationType;
  actor: NotificationActor;
  blog?: NotificationBlog | null;
  comment?: { id: number; comment: string };
  reply?: { id: number; comment: string };
  created_at: string;
}
