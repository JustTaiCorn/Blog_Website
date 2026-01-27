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

  getBlog: async (blog_id: string): Promise<{ blog: Blog }> => {
    const res = await api.get<{ blog: Blog }>(`/blogs/${blog_id}`);
    return res.data;
  },
};
