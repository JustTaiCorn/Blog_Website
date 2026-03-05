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
    page: number = 1,
    limit: number = 5,
    sort: "asc" | "desc" = "desc",
  ) => {
    const res = await api.get<{
      blogs: Blog[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/blogs?page=${page}&limit=${limit}&sort=${sort}`);
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
};

// React Query Hooks

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useFetchBlogs = (sort: "asc" | "desc" = "desc") => {
  return useInfiniteQuery({
    queryKey: ["blogs", sort],
    queryFn: ({ pageParam = 1 }) => blogService.getAllBlogs(pageParam, 5, sort),
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

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blog_id: string) => blogService.delete(blog_id),
    onSuccess: () => {
      toast.success("Xoá bài viết thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Xoá bài viết thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useMyBlogs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["my-blogs", page, limit],
    queryFn: () => blogService.getMyBlogs(page, limit),
  });
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

export const useLikeStatus = (blog_id: string) => {
  return useQuery({
    queryKey: ["like-status", blog_id],
    queryFn: () => interactionService.getLikeStatus(blog_id),
    enabled: !!blog_id,
    staleTime: 0,
  });
};

export const useToggleLike = (blog_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => interactionService.toggleLike(blog_id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["like-status", blog_id] });
      const prev = queryClient.getQueryData<{
        liked: boolean;
        total_likes: number;
      }>(["like-status", blog_id]);
      if (prev) {
        queryClient.setQueryData(["like-status", blog_id], {
          liked: !prev.liked,
          total_likes: prev.liked ? prev.total_likes - 1 : prev.total_likes + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev) {
        queryClient.setQueryData(["like-status", blog_id], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["like-status", blog_id] });
      queryClient.invalidateQueries({ queryKey: ["blog", blog_id] });
    },
  });
};
