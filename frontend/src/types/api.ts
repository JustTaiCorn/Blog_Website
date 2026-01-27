import type { NotificationType } from "./entities";

// ==================== GENERIC API TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// ==================== PAGINATION ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== AUTH RESPONSE ====================

export interface AuthResponse {
  user: import("./responses").UserProfile;
  access_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// ==================== QUERY PARAMS ====================

export interface BlogQueryParams extends PaginationParams {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  draft?: boolean;
  sort?: "latest" | "popular" | "trending";
}

export interface CommentQueryParams extends PaginationParams {
  blog_id: number;
  parent_id?: number | null;
}

export interface NotificationQueryParams extends PaginationParams {
  type?: NotificationType;
  seen?: boolean;
}

export interface UserBlogsQueryParams extends PaginationParams {
  draft?: boolean;
}

// ==================== UPLOAD TYPES ====================

export interface UploadResponse {
  url: string;
  public_id?: string;
}

export interface ImageUploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
}

// ==================== EDITOR TYPES ====================

export interface EditorBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorData {
  time?: number;
  blocks: EditorBlock[];
  version?: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  total_blogs: number;
  total_reads: number;
  total_likes: number;
  total_comments: number;
  drafts_count: number;
}

export interface NotificationCount {
  total: number;
  unread: number;
}
