// ==================== ENUMS (as const) ====================
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface UserRoleEntry {
  role: UserRole;
}

export const LikeType = {
  UP: "UP",
  DOWN: "DOWN",
} as const;

export type LikeType = (typeof LikeType)[keyof typeof LikeType];

export const NotificationType = {
  like: "like",
  comment: "comment",
  reply: "reply",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

// ==================== BASE ENTITIES ====================

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  bio: string;
  profile_img: string | null;
  profile_img_id: string | null;
  verified: boolean;
  google_auth: boolean;
  deleted: boolean;
  total_posts: number;
  total_reads: number;
  created_at: string;
  updated_at: string;
  roles: UserRoleEntry[];
}

export interface UserSocialLinks {
  user_id: number;
  youtube: string;
  instagram: string;
  facebook: string;
  twitter: string;
  github: string;
  website: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  details: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  blog_id: string;
  title: string;
  slug: string;
  banner: string | null;
  des: string | null;
  content: unknown;
  author_id: number;
  category_id: number | null;
  draft: boolean;
  published: boolean;
  published_at: string | null;
  activity_total_likes: number;
  activity_total_comments: number;
  activity_total_reads: number;
  activity_total_parent_comments: number;
  created_at: string;
  updated_at: string;

  // Populated relations (optional, present when included in query)
  author?: Pick<User, "fullname" | "username" | "profile_img">;
  category?: Category | null;
  tags?: { tag: Tag }[];
}

export interface Comment {
  id: number;
  blog_id: number;
  blog_author_id: number;
  comment: string;
  commented_by: number;
  parent_id: number | null;
  is_reply: boolean;
  active: boolean;
  commented_at: string;
  updated_at: string;
}

export interface BlogLike {
  user_id: number;
  blog_id: number;
  type: LikeType;
  created_at: string;
}

export interface CommentLike {
  user_id: number;
  comment_id: number;
  type: LikeType;
  created_at: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  blog_id: number;
  notification_for: number;
  user_id: number;
  comment_id: number | null;
  reply_id: number | null;
  replied_on_comment_id: number | null;
  seen: boolean;
  created_at: string;
  updated_at: string;
}
