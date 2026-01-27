import type {
  UserSocialLinks,
  Category,
  Tag,
  Blog,
  Comment,
  Notification,
} from "./entities";

// ==================== USER RESPONSE TYPES ====================

export interface UserPublicProfile {
  id: number;
  username: string;
  fullname: string;
  bio: string;
  profile_img: string | null;
  total_posts: number;
  total_reads: number;
  created_at: string;
  social_links?: UserSocialLinks;
}

export interface UserProfile extends UserPublicProfile {
  email: string;
  verified: boolean;
  google_auth: boolean;
}

// ==================== BLOG RESPONSE TYPES ====================

export interface BlogWithAuthor extends Blog {
  author: UserPublicProfile;
  category?: Category | null;
  tags?: Tag[];
}

export interface BlogCard {
  blog_id: string;
  title: string;
  slug: string;
  banner: string | null;
  des: string | null;
  published_at: string | null;
  activity_total_likes: number;
  activity_total_comments: number;
  activity_total_reads: number;
  author: {
    username: string;
    fullname: string;
    profile_img: string | null;
  };
  category?: {
    name: string;
    slug: string;
  } | null;
  tags?: { name: string; slug: string }[];
}

export interface BlogDetail extends BlogWithAuthor {
  isLiked?: boolean;
  userLikeType?: "UP" | "DOWN" | null;
}

// ==================== COMMENT RESPONSE TYPES ====================

export interface CommentUser {
  id: number;
  username: string;
  fullname: string;
  profile_img: string | null;
}

export interface CommentWithUser extends Comment {
  commenter: CommentUser;
  replies?: CommentWithUser[];
  likes_count?: number;
  isLiked?: boolean;
  userLikeType?: "UP" | "DOWN" | null;
}

// ==================== NOTIFICATION RESPONSE TYPES ====================

export interface NotificationBlog {
  blog_id: string;
  title: string;
  slug: string;
}

export interface NotificationActor {
  username: string;
  fullname: string;
  profile_img: string | null;
}

export interface NotificationComment {
  id: number;
  comment: string;
}

export interface NotificationWithDetails extends Notification {
  blog: NotificationBlog;
  actor: NotificationActor;
  comment?: NotificationComment | null;
  reply?: NotificationComment | null;
}
