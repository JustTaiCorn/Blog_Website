import type { UserSocialLinks } from "./entities";
import type { NotificationType } from "./entities";


export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  access_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  fullname?: string;
  bio?: string;
  profile_img?: string | null;
  social_links?: Partial<Omit<UserSocialLinks, "user_id" | "updated_at">>;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateAvatarRequest {
  profile_img: string;
  profile_img_id?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface CreateBlogRequest {
  title: string;
  slug?: string;
  banner?: string | null;
  des?: string;
  content: unknown; // Editor.js output data
  category_id?: number | null;
  tags?: string[];
  draft?: boolean;
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  blog_id: string;
}

export interface PublishBlogRequest {
  blog_id: string;
}


export interface CreateCommentRequest {
  blog_id: number;
  comment: string;
  parent_id?: number | null;
}

export interface UpdateCommentRequest {
  comment_id: number;
  comment: string;
}

export interface DeleteCommentRequest {
  comment_id: number;
}

// ==================== LIKE REQUESTS ====================

export interface ToggleBlogLikeRequest {
  blog_id: number;
  type?: "UP" | "DOWN";
}

export interface ToggleCommentLikeRequest {
  comment_id: number;
  type?: "UP" | "DOWN";
}

// ==================== NOTIFICATION REQUESTS ====================

export interface MarkNotificationSeenRequest {
  notification_id: number;
}

export interface MarkAllNotificationsSeenRequest {
  type?: NotificationType;
}

// ==================== SEARCH REQUESTS ====================

export interface SearchRequest {
  query: string;
  type?: "blogs" | "users" | "tags";
  page?: number;
  limit?: number;
}
