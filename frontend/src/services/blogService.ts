import api from "@/lib/axios";
import type { Blog } from "@/types/entities";

export interface CreateBlogRequest {
  title: string;
  content: any;
  banner?: string | null;
  des?: string;
  category_id?: number | null;
  tags?: string[];
  draft?: boolean;
}

export interface UploadBannerResponse {
  url: string;
  public_id: string;
}

export const blogService = {
  create: async (
    data: CreateBlogRequest,
  ): Promise<{ blog_id: string; message: string }> => {
    const res = await api.post<{ blog_id: string; message: string }>(
      "/blogs/create",
      data,
    );
    return res.data;
  },

  update: async (
    blog_id: string,
    data: CreateBlogRequest,
  ): Promise<{ blog_id: string; message: string }> => {
    const res = await api.put<{ blog_id: string; message: string }>(
      `/blogs/update/${blog_id}`,
      data,
    );
    return res.data;
  },

  uploadBanner: async (file: File): Promise<UploadBannerResponse> => {
    const formData = new FormData();
    formData.append("banner", file);
    const res = await api.post<UploadBannerResponse>(
      "/blogs/upload-banner",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  uploadImage: async (file: File): Promise<UploadBannerResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post<UploadBannerResponse>(
      "/blogs/upload-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  getBlog: async (blog_id: string): Promise<{ blog: Blog }> => {
    const res = await api.get<{ blog: Blog }>(`/blogs/${blog_id}`);
    return res.data;
  },

  getCategories: async (): Promise<any[]> => {
    const res = await api.get<{ categories: any[] }>("/blogs/categories/all");
    return res.data.categories;
  },

  getTags: async (): Promise<string[]> => {
    const res = await api.get<{ tags: string[] }>("/blogs/tags/all");
    return res.data.tags;
  },

  getAllBlogs: async (
    params: {
      page?: number;
      limit?: number;
      sort?: "asc" | "desc";
      sortBy?: "date" | "views" | "likes";
      category?: string;
      author?: string;
    } = {},
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page ?? 1));
    searchParams.set("limit", String(params.limit ?? 5));
    searchParams.set("sort", params.sort ?? "desc");
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.category) searchParams.set("category", params.category);
    if (params.author) searchParams.set("author", params.author);
    const res = await api.get<{
      blogs: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/blogs?${searchParams.toString()}`);
    return res.data;
  },

  getTrendingBlogs: async (): Promise<{ blogs: Blog[] }> => {
    const res = await api.get<{ blogs: Blog[] }>("/blogs/trending");
    return res.data;
  },

  delete: async (blog_id: string): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/blogs/${blog_id}`);
    return res.data;
  },

  getMyBlogs: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    blogs: Blog[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const res = await api.get(`/blogs/my-blogs?page=${page}&limit=${limit}`);
    return res.data;
  },

  search: async (
    q: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    blogs: Blog[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
    });
    const res = await api.get(`/blogs/search?${params.toString()}`);
    return res.data;
  },
};

export const interactionService = {
  getLikeStatus: async (
    blog_id: string,
  ): Promise<{ liked: boolean; total_likes: number }> => {
    const res = await api.get(`/blogs/${blog_id}/like`);
    return res.data;
  },

  toggleLike: async (
    blog_id: string,
  ): Promise<{ liked: boolean; message: string }> => {
    const res = await api.post(`/blogs/${blog_id}/like`);
    return res.data;
  },
};
