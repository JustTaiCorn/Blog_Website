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

  getCategories: async (): Promise<any[]> => {
    const res = await api.get<{ categories: any[] }>("/blogs/categories/all");
    return res.data.categories;
  },

  getTags: async (): Promise<string[]> => {
    const res = await api.get<{ tags: string[] }>("/blogs/tags/all");
    return res.data.tags;
  },
  getAllBlogs: async (
    page: number = 1,
    limit: number = 5,
    category?: string,
  ) => {
    const res = await api.get<{
      blogs: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/blogs?page=${page}&limit=${limit}&category=${category || ""}`);
    return res.data;
  },
};

// React Query Hooks

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useFetchBlogs = (category?: string) => {
  return useInfiniteQuery({
    queryKey: ["blogs", category],
    queryFn: ({ pageParam = 1 }) =>
      blogService.getAllBlogs(pageParam, 5, category),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const useFetchBlog = (blog_id: string) => {
  return useQuery({
    queryKey: ["blog", blog_id],
    queryFn: () => blogService.getBlog(blog_id),
    enabled: !!blog_id,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogService.getCategories(),
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: () => blogService.getTags(),
  });
};

export const useUploadBanner = () => {
  return useMutation({
    mutationFn: (file: File) => blogService.uploadBanner(file),
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Upload ảnh thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogService.create(data),
    onSuccess: (data) => {
      toast.success(data.message || "Đăng bài thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Đăng bài thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      blog_id,
      data,
    }: {
      blog_id: string;
      data: CreateBlogRequest;
    }) => blogService.update(blog_id, data),
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(errorMessage);
    },
  });
};
